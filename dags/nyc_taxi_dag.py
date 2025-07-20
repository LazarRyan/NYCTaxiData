from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
import requests
import os
import logging
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, lit, round, unix_timestamp


# Default arguments for the DAG
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# DAG definition
dag = DAG(
    'nyc_taxi_pipeline',
    default_args=default_args,
    description='NYC Taxi Data Pipeline',
    schedule_interval='@monthly',
    catchup=False,
    tags=['nyc', 'taxi', 'data-pipeline'],
)

def download_nyc_taxi_data(**context):
    """
    Download NYC taxi data for a specific month
    """
    import requests
    from datetime import datetime
    
    # Get the execution date from context
    execution_date = context['execution_date']
    year = execution_date.year
    month = execution_date.month
    
    # Create data directory if it doesn't exist
    os.makedirs('/opt/airflow/data/raw', exist_ok=True)
    
    # NYC TLC data URL pattern
    # Note: Data is typically available 2-3 months after the actual month
    # For demo purposes, we'll use a recent available month
    if year == 2025 and month >= 7:
        # Use a recent available month instead (April 2025 should be available)
        year = 2025
        month = 4  # April 2025 should be available
    elif year == 2025 and month >= 5:
        # Use March 2025
        year = 2025
        month = 3  # March 2025 should be available
    
    # Format month with leading zero
    month_str = f"{month:02d}"
    
    # NYC TLC Yellow Taxi data URL
    url = f"https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_{year}-{month_str}.parquet"
    
    # Local file path
    local_file = f"/opt/airflow/data/raw/yellow_tripdata_{year}-{month_str}.parquet"
    
    try:
        logging.info(f"Downloading data from: {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(local_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logging.info(f"Successfully downloaded data to: {local_file}")
        
        # Return the file path for downstream tasks
        return local_file
        
    except Exception as e:
        logging.error(f"Error downloading data: {str(e)}")
        raise

def run_spark_processing(**context):
    """Run PySpark processing job for NYC taxi data"""
    import subprocess
    import time
    
    # Get Supabase connection URL from environment
    supabase_url = os.getenv('SUPABASE_DATABASE_URL')
    
    if not supabase_url:
        logging.error("SUPABASE_DATABASE_URL environment variable not set")
        raise ValueError("SUPABASE_DATABASE_URL environment variable is required")
    
    # Parse Supabase URL to get connection details
    from urllib.parse import urlparse
    parsed_url = urlparse(supabase_url)
    
    db_host = parsed_url.hostname
    db_port = parsed_url.port or 5432
    db_name = parsed_url.path.lstrip('/')
    db_user = parsed_url.username
    db_password = parsed_url.password
    
    # First, drop and recreate the table with correct schema
    logging.info("Recreating table with correct schema...")
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS taxi_trips CASCADE;")
        cursor.execute("""
            CREATE TABLE taxi_trips (
                id SERIAL PRIMARY KEY,
                pickup_datetime TIMESTAMP,
                dropoff_datetime TIMESTAMP,
                pickup_location_id INTEGER,
                dropoff_location_id INTEGER,
                trip_distance DECIMAL(10,2),
                fare_amount DECIMAL(10,2),
                tip_amount DECIMAL(10,2),
                total_amount DECIMAL(10,2),
                payment_type INTEGER,
                trip_duration_minutes INTEGER,
                tip_percentage DECIMAL(8,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_pickup_datetime ON taxi_trips(pickup_datetime);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_pickup_location ON taxi_trips(pickup_location_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_dropoff_location ON taxi_trips(dropoff_location_id);")
        conn.commit()
        cursor.close()
        conn.close()
        logging.info("Table recreated with correct schema")
    except Exception as e:
        logging.warning(f"Could not recreate table: {e}")
    
    # Process the data using PySpark for better performance
    logging.info("Processing NYC taxi data with PySpark...")
    
    try:
        # Set Spark home environment variable
        import os
        os.environ['SPARK_HOME'] = '/opt/spark'
        os.environ['PATH'] = f"/opt/spark/bin:{os.environ.get('PATH', '')}"
        
        # Create Spark session in local mode with PostgreSQL JDBC driver
        spark = SparkSession.builder \
            .appName("NYC_Taxi_Data_Processing") \
            .config("spark.master", "local[*]") \
            .config("spark.driver.memory", "2g") \
            .config("spark.executor.memory", "2g") \
            .config("spark.sql.adaptive.enabled", "true") \
            .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
            .config("spark.jars.packages", "org.postgresql:postgresql:42.6.0") \
            .getOrCreate()
        
        # Read the parquet file
        input_file = '/opt/airflow/data/raw/yellow_tripdata_2025-04.parquet'
        df = spark.read.parquet(input_file)
        
        logging.info(f"Loaded {df.count()} records from parquet file")
        logging.info(f"Columns: {df.columns}")
        
        # Clean and transform the data using Spark SQL
        processed_df = df.select(
            col("tpep_pickup_datetime").cast("timestamp").alias("pickup_datetime"),
            col("tpep_dropoff_datetime").cast("timestamp").alias("dropoff_datetime"),
            col("PULocationID").cast("integer").alias("pickup_location_id"),
            col("DOLocationID").cast("integer").alias("dropoff_location_id"),
            col("trip_distance").cast("decimal(10,2)").alias("trip_distance"),
            col("fare_amount").cast("decimal(10,2)").alias("fare_amount"),
            col("tip_amount").cast("decimal(10,2)").alias("tip_amount"),
            col("total_amount").cast("decimal(10,2)").alias("total_amount"),
            col("payment_type").cast("integer").alias("payment_type")
        ).withColumn(
            "trip_duration_minutes",
            round((unix_timestamp("dropoff_datetime") - unix_timestamp("pickup_datetime")) / 60, 0).cast("integer")
        ).withColumn(
            "tip_percentage",
            when(col("fare_amount") > 0, round((col("tip_amount") / col("fare_amount")) * 100, 2))
            .otherwise(lit(0)).cast("decimal(8,2)")
        ).filter(
            # Remove invalid data
            (col("pickup_datetime").isNotNull()) &
            (col("dropoff_datetime").isNotNull()) &
            (col("trip_distance") > 0) &
            (col("fare_amount") > 0) &
            (col("trip_duration_minutes") > 0) &
            (col("trip_duration_minutes") <= 180)  # Max 3 hours
        )
        
        logging.info(f"Processed {processed_df.count()} valid trips")
        
        # Save to Supabase using Spark JDBC
        logging.info("Saving to Supabase using Spark JDBC...")
        
        # Build JDBC URL for Supabase
        jdbc_url = f"jdbc:postgresql://{db_host}:{db_port}/{db_name}"
        
        processed_df.write \
            .format("jdbc") \
            .option("url", jdbc_url) \
            .option("dbtable", "taxi_trips") \
            .option("user", db_user) \
            .option("password", db_password) \
            .option("driver", "org.postgresql.Driver") \
            .option("batchsize", 1000) \
            .mode("append") \
            .save()
        
        logging.info("Data successfully saved to Supabase using Spark!")
        
        # Show summary statistics using Spark
        total_trips = processed_df.count()
        avg_fare = processed_df.agg({"fare_amount": "avg"}).collect()[0][0]
        avg_distance = processed_df.agg({"trip_distance": "avg"}).collect()[0][0]
        avg_tip_percentage = processed_df.agg({"tip_percentage": "avg"}).collect()[0][0]
        
        logging.info(f"Summary Statistics:")
        logging.info(f"  Total trips processed: {total_trips}")
        logging.info(f"  Average fare: ${avg_fare:.2f}")
        logging.info(f"  Average distance: {avg_distance:.2f} miles")
        logging.info(f"  Average tip percentage: {avg_tip_percentage:.2f}%")
        
        # Stop Spark session
        spark.stop()
        
        logging.info("Data processing completed successfully!")
        return True
        
    except Exception as e:
        logging.error(f"Data processing failed: {str(e)}")
        raise

def download_taxi_zones(**context):
    """
    Download NYC taxi zone lookup data and GeoJSON boundaries
    """
    import requests
    import os
    import json
    
    # Create data directory if it doesn't exist
    os.makedirs('/opt/airflow/data/zones', exist_ok=True)
    
    # Download zone lookup CSV
    zone_lookup_url = "https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv"
    zone_lookup_file = "/opt/airflow/data/zones/taxi_zone_lookup.csv"
    
    try:
        logging.info(f"Downloading zone lookup from: {zone_lookup_url}")
        response = requests.get(zone_lookup_url)
        response.raise_for_status()
        
        with open(zone_lookup_file, 'wb') as f:
            f.write(response.content)
        
        logging.info(f"Successfully downloaded zone lookup to: {zone_lookup_file}")
        
        # Download zone GeoJSON boundaries from NYC Open Data
        zone_geojson_url = "https://data.cityofnewyork.us/api/geospatial/d3c5-ddgc?method=export&format=GeoJSON"
        zone_geojson_file = "/opt/airflow/data/zones/taxi_zones.geojson"
        
        logging.info(f"Downloading zone GeoJSON from: {zone_geojson_url}")
        response = requests.get(zone_geojson_url)
        response.raise_for_status()
        
        with open(zone_geojson_file, 'wb') as f:
            f.write(response.content)
        
        logging.info(f"Successfully downloaded zone GeoJSON to: {zone_geojson_file}")
        
        return zone_lookup_file, zone_geojson_file
        
    except requests.exceptions.HTTPError as e:
        logging.warning(f"Could not download GeoJSON file: {e}")
        logging.info("Proceeding with zone lookup only - will create simplified zone mapping")
        return zone_lookup_file, None
        
    except Exception as e:
        logging.error(f"Error downloading zone data: {str(e)}")
        raise

def create_zone_aggregations(**context):
    """
    Create zone-level aggregations for choropleth visualization
    """
    import pandas as pd
    import psycopg2
    import json
    import os
    
    # Get Supabase connection URL from environment
    supabase_url = os.getenv('SUPABASE_DATABASE_URL')
    
    if not supabase_url:
        logging.error("SUPABASE_DATABASE_URL environment variable not set")
        raise ValueError("SUPABASE_DATABASE_URL environment variable is required")
    
    # Parse Supabase URL to get connection details
    from urllib.parse import urlparse
    parsed_url = urlparse(supabase_url)
    
    db_host = parsed_url.hostname
    db_port = parsed_url.port or 5432
    db_name = parsed_url.path.lstrip('/')
    db_user = parsed_url.username
    db_password = parsed_url.password
    
    try:
        # Read zone lookup data
        zone_lookup_file = "/opt/airflow/data/zones/taxi_zone_lookup.csv"
        zones_df = pd.read_csv(zone_lookup_file)
        
        # Check if GeoJSON file exists
        zone_geojson_file = "/opt/airflow/data/zones/taxi_zones.geojson"
        has_geojson = os.path.exists(zone_geojson_file)
        
        if has_geojson:
            logging.info("Using GeoJSON boundaries for zone mapping")
            # Load GeoJSON for future use (we'll implement this later)
            with open(zone_geojson_file, 'r') as f:
                geojson_data = json.load(f)
        else:
            logging.info("No GeoJSON file available - using simplified zone mapping")
            geojson_data = None
        
        # Connect to Supabase database
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        
        # Get pickup zone aggregations
        pickup_query = """
        SELECT 
            pickup_location_id,
            COUNT(*) as trip_count,
            SUM(total_amount) as total_revenue,
            AVG(trip_distance) as avg_distance,
            AVG(trip_duration_minutes) as avg_duration,
            AVG(tip_percentage) as avg_tip_percentage
        FROM taxi_trips 
        WHERE pickup_location_id IS NOT NULL
        GROUP BY pickup_location_id
        """
        
        pickup_df = pd.read_sql(pickup_query, conn)
        
        # Get dropoff zone aggregations
        dropoff_query = """
        SELECT 
            dropoff_location_id,
            COUNT(*) as trip_count,
            SUM(total_amount) as total_revenue,
            AVG(trip_distance) as avg_distance,
            AVG(trip_duration_minutes) as avg_duration,
            AVG(tip_percentage) as avg_tip_percentage
        FROM taxi_trips 
        WHERE dropoff_location_id IS NOT NULL
        GROUP BY dropoff_location_id
        """
        
        dropoff_df = pd.read_sql(dropoff_query, conn)
        
        # Join with zone names
        pickup_df = pickup_df.merge(
            zones_df[['LocationID', 'Zone', 'Borough']], 
            left_on='pickup_location_id', 
            right_on='LocationID', 
            how='left'
        ).rename(columns={'Zone': 'pickup_zone', 'Borough': 'pickup_borough'})
        
        dropoff_df = dropoff_df.merge(
            zones_df[['LocationID', 'Zone', 'Borough']], 
            left_on='dropoff_location_id', 
            right_on='LocationID', 
            how='left'
        ).rename(columns={'Zone': 'dropoff_zone', 'Borough': 'dropoff_borough'})
        
        # Create zone aggregations table
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS zone_aggregations CASCADE;")
        cursor.execute("""
            CREATE TABLE zone_aggregations (
                location_id INTEGER PRIMARY KEY,
                zone_name VARCHAR(255),
                borough VARCHAR(100),
                pickup_trips INTEGER,
                pickup_revenue DECIMAL(12,2),
                pickup_avg_distance DECIMAL(8,2),
                pickup_avg_duration DECIMAL(8,2),
                pickup_avg_tip DECIMAL(8,2),
                dropoff_trips INTEGER,
                dropoff_revenue DECIMAL(12,2),
                dropoff_avg_distance DECIMAL(8,2),
                dropoff_avg_duration DECIMAL(8,2),
                dropoff_avg_tip DECIMAL(8,2),
                total_trips INTEGER,
                total_revenue DECIMAL(12,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Combine pickup and dropoff data
        combined_df = pickup_df.merge(
            dropoff_df[['dropoff_location_id', 'trip_count', 'total_revenue', 'avg_distance', 'avg_duration', 'avg_tip_percentage', 'dropoff_zone', 'dropoff_borough']],
            left_on='pickup_location_id',
            right_on='dropoff_location_id',
            how='outer',
            suffixes=('_pickup', '_dropoff')
        )
        
        # Fill NaN values
        combined_df = combined_df.fillna(0)
        
        # Calculate totals
        combined_df['total_trips'] = combined_df['trip_count_pickup'] + combined_df['trip_count_dropoff']
        combined_df['total_revenue'] = combined_df['total_revenue_pickup'] + combined_df['total_revenue_dropoff']
        
        # Insert into database
        for _, row in combined_df.iterrows():
            cursor.execute("""
                INSERT INTO zone_aggregations (
                    location_id, zone_name, borough,
                    pickup_trips, pickup_revenue, pickup_avg_distance, pickup_avg_duration, pickup_avg_tip,
                    dropoff_trips, dropoff_revenue, dropoff_avg_distance, dropoff_avg_duration, dropoff_avg_tip,
                    total_trips, total_revenue
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                row['pickup_location_id'],
                row['pickup_zone'] or row['dropoff_zone'],
                row['pickup_borough'] or row['dropoff_borough'],
                row['trip_count_pickup'],
                row['total_revenue_pickup'],
                row['avg_distance_pickup'],
                row['avg_duration_pickup'],
                row['avg_tip_percentage_pickup'],
                row['trip_count_dropoff'],
                row['total_revenue_dropoff'],
                row['avg_distance_dropoff'],
                row['avg_duration_dropoff'],
                row['avg_tip_percentage_dropoff'],
                row['total_trips'],
                row['total_revenue']
            ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logging.info(f"Created zone aggregations for {len(combined_df)} zones")
        return True
        
    except Exception as e:
        logging.error(f"Error creating zone aggregations: {str(e)}")
        raise

def update_streamlit_metrics(**context):
    """
    Update Streamlit metrics and trigger dashboard refresh
    """
    import requests
    import time
    
    # Wait a bit for the database to be updated
    time.sleep(5)
    
    # In a real scenario, you might trigger a Streamlit app refresh
    # For now, we'll just log that metrics should be updated
    logging.info("Streamlit metrics should be refreshed with new data")
    
    # You could also make an API call to refresh the Streamlit app
    # requests.post('http://streamlit:8501/_stcore/forward')
    
    return "Metrics updated successfully"

# Task 1: Download NYC taxi data
download_data_task = PythonOperator(
    task_id='download_data_task',
    python_callable=download_nyc_taxi_data,
    dag=dag,
)

# Task 2: Run PySpark processing
spark_processing_task = PythonOperator(
    task_id='spark_processing_task',
    python_callable=run_spark_processing,
    dag=dag,
)

# Task 3: Create database tables (if they don't exist)
create_tables_task = PostgresOperator(
    task_id='create_tables_task',
    postgres_conn_id='postgres_default',
    sql="""
    CREATE TABLE IF NOT EXISTS taxi_trips (
        id SERIAL PRIMARY KEY,
        pickup_datetime TIMESTAMP,
        dropoff_datetime TIMESTAMP,
        pickup_location_id INTEGER,
        dropoff_location_id INTEGER,
        trip_distance DECIMAL(10,2),
        fare_amount DECIMAL(10,2),
        tip_amount DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        payment_type INTEGER,
        trip_duration_minutes INTEGER,
        tip_percentage DECIMAL(8,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_pickup_datetime ON taxi_trips(pickup_datetime);
    CREATE INDEX IF NOT EXISTS idx_pickup_location ON taxi_trips(pickup_location_id);
    CREATE INDEX IF NOT EXISTS idx_dropoff_location ON taxi_trips(dropoff_location_id);
    """,
    dag=dag,
)

# Task 4: Download taxi zone data
download_zones_task = PythonOperator(
    task_id='download_zones_task',
    python_callable=download_taxi_zones,
    dag=dag,
)

# Task 5: Create zone aggregations
zone_aggregations_task = PythonOperator(
    task_id='zone_aggregations_task',
    python_callable=create_zone_aggregations,
    dag=dag,
)

# Task 6: Update Streamlit metrics
update_metrics_task = PythonOperator(
    task_id='update_metrics_task',
    python_callable=update_streamlit_metrics,
    dag=dag,
)

# Define task dependencies
download_data_task >> create_tables_task >> spark_processing_task >> download_zones_task >> zone_aggregations_task >> update_metrics_task 
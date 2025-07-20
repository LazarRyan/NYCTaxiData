#!/usr/bin/env python3
"""
Load sample data into Supabase for testing
"""

import os
import pandas as pd
import sqlalchemy
from sqlalchemy import text
import numpy as np
from datetime import datetime, timedelta

def generate_sample_data():
    """Generate sample NYC taxi data"""
    np.random.seed(42)
    
    # Generate 50,000 sample records
    n_records = 50000
    
    # Date range: Last 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Generate random pickup times
    pickup_times = pd.date_range(start=start_date, end=end_date, periods=n_records)
    
    # Generate sample data
    data = {
        'pickup_datetime': pickup_times,
        'dropoff_datetime': pickup_times + pd.Timedelta(minutes=np.random.uniform(5, 60, n_records)),
        'pickup_location_id': np.random.randint(1, 264, n_records),
        'dropoff_location_id': np.random.randint(1, 264, n_records),
        'trip_distance': np.random.uniform(0.5, 25, n_records),
        'fare_amount': np.random.uniform(2.5, 50, n_records),
        'tip_amount': np.random.uniform(0, 10, n_records),
        'total_amount': np.random.uniform(3, 60, n_records),
        'payment_type': np.random.choice([1, 2, 3, 4], n_records, p=[0.7, 0.2, 0.08, 0.02]),
        'trip_duration_minutes': np.random.uniform(5, 60, n_records),
        'tip_percentage': np.random.uniform(0, 25, n_records)
    }
    
    df = pd.DataFrame(data)
    
    # Add derived columns
    df['pickup_hour'] = df['pickup_datetime'].dt.hour
    df['pickup_day_of_week'] = df['pickup_datetime'].dt.dayofweek
    df['pickup_month'] = df['pickup_datetime'].dt.month
    
    return df

def load_to_supabase():
    """Load sample data to Supabase"""
    
    # Get connection URL from environment or use the one you provided
    supabase_url = os.getenv('SUPABASE_DATABASE_URL')
    
    if not supabase_url:
        print("Please set SUPABASE_DATABASE_URL environment variable")
        print("Example: export SUPABASE_DATABASE_URL='postgresql://postgres:[YOUR-PASSWORD]@db.dgdqhchrfwcsvzhefyis.supabase.co:5432/postgres'")
        return False
    
    try:
        # Create engine
        engine = sqlalchemy.create_engine(supabase_url)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✅ Successfully connected to Supabase")
        
        # Generate sample data
        print("Generating sample data...")
        df = generate_sample_data()
        print(f"Generated {len(df)} sample records")
        
        # Insert data into Supabase
        print("Loading data into Supabase...")
        
        # Use chunked insertion for better performance
        chunk_size = 5000
        total_chunks = len(df) // chunk_size + 1
        
        for i in range(0, len(df), chunk_size):
            chunk = df.iloc[i:i+chunk_size]
            chunk.to_sql('taxi_trips', engine, if_exists='append', index=False, method='multi')
            print(f"✅ Inserted chunk {i//chunk_size + 1}/{total_chunks}")
        
        print("✅ Sample data successfully loaded into Supabase!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading data to Supabase: {str(e)}")
        return False

if __name__ == "__main__":
    print("NYC Taxi Data - Sample Data Loader")
    print("=" * 40)
    
    if load_to_supabase():
        print("\n🎉 Setup complete! Your Streamlit app should now work with real data.")
        print("\nNext steps:")
        print("1. Deploy your Streamlit app to Streamlit Cloud")
        print("2. Set the SUPABASE_DATABASE_URL secret in Streamlit Cloud")
        print("3. Your app will now connect to Supabase!")
    else:
        print("\n❌ Setup failed. Please check your connection details.") 
# NYC Taxi Data Pipeline - Supabase Setup

This guide will help you set up the NYC taxi data pipeline to use Supabase instead of local PostgreSQL.

## Prerequisites

1. **Supabase Project**: You've already created a Supabase project
2. **Docker**: Make sure Docker is installed and running
3. **Supabase Connection URL**: `postgresql://postgres:[YOUR-PASSWORD]@db.dgdqhchrfwcsvzhefyis.supabase.co:5432/postgres`

## Step 1: Set up Supabase Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Copy and paste the contents of `supabase_setup.sql` and run it
4. This creates the necessary tables and sets up proper permissions

## Step 2: Set Environment Variable

Set your Supabase connection URL as an environment variable:

```bash
export SUPABASE_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.dgdqhchrfwcsvzhefyis.supabase.co:5432/postgres"
```

**Replace `[YOUR-PASSWORD]` with your actual Supabase database password.**

## Step 3: Run the Pipeline

### Option A: Use the helper script
```bash
./run_pipeline.sh
```

### Option B: Manual setup
```bash
# Set environment variable
export SUPABASE_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.dgdqhchrfwcsvzhefyis.supabase.co:5432/postgres"

# Start Docker services
docker-compose up -d

# Wait for services to start (about 30 seconds)
# Then access Airflow at http://localhost:8080
```

## Step 4: Run the Airflow Pipeline

1. **Access Airflow**: Go to http://localhost:8080
   - Username: `airflow`
   - Password: `airflow`

2. **Trigger the DAG**: 
   - Find the `nyc_taxi_pipeline` DAG
   - Click the "Play" button to trigger it
   - The pipeline will:
     - Download NYC taxi data
     - Process it with PySpark
     - Load it into your Supabase database
     - Create zone aggregations

## Step 5: Deploy to Streamlit Cloud

1. **Set Streamlit Cloud Secret**:
   - Go to your Streamlit Cloud app settings
   - Add this secret:
   ```toml
   SUPABASE_DATABASE_URL = "postgresql://postgres:[YOUR-PASSWORD]@db.dgdqhchrfwcsvzhefyis.supabase.co:5432/postgres"
   ```

2. **Deploy**: Your app will now connect to Supabase instead of local PostgreSQL

## What's Changed

### Airflow DAG Updates
- ✅ Modified `run_spark_processing()` to use Supabase
- ✅ Modified `create_zone_aggregations()` to use Supabase
- ✅ Added environment variable support

### Streamlit App Updates
- ✅ Updated to use `SUPABASE_DATABASE_URL` environment variable
- ✅ Added fallback to demo mode if database connection fails
- ✅ Improved error handling

### Docker Configuration
- ✅ Added `SUPABASE_DATABASE_URL` to Airflow environment
- ✅ Updated connection handling

## Troubleshooting

### Connection Issues
- **Check your password**: Make sure you're using the correct Supabase database password
- **Check network**: Ensure your local machine can reach Supabase
- **Check environment variable**: Verify `SUPABASE_DATABASE_URL` is set correctly

### Data Processing Issues
- **Check logs**: Airflow logs will show detailed error messages
- **Check Supabase**: Verify tables were created in your Supabase dashboard
- **Check permissions**: Ensure the database user has proper permissions

### Streamlit Cloud Issues
- **Check secrets**: Verify the secret is set correctly in Streamlit Cloud
- **Check deployment**: Make sure the app is deployed with the latest code

## Benefits of Using Supabase

1. **Cloud Database**: No need to run local PostgreSQL
2. **Automatic Backups**: Supabase handles database backups
3. **Scalability**: Can handle larger datasets
4. **Real-time**: Supports real-time subscriptions
5. **Security**: Built-in security features
6. **Monitoring**: Built-in monitoring and analytics

## Next Steps

1. **Run the pipeline** to load real data into Supabase
2. **Deploy to Streamlit Cloud** with the updated configuration
3. **Monitor performance** in your Supabase dashboard
4. **Scale up** by processing more months of data

Your NYC taxi analytics dashboard will now be powered by Supabase! 🚕 
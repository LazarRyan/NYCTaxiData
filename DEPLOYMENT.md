# 🚀 Streamlit Cloud Deployment Guide

## Overview
This guide explains how to deploy the NYC Taxi Data Pipeline dashboard to Streamlit Cloud.

## Prerequisites
- GitHub account
- Streamlit Cloud account (free tier available)
- PostgreSQL database (can use external service like Supabase, Railway, or Neon)

## Deployment Steps

### 1. Database Setup
Since Streamlit Cloud doesn't support PostgreSQL containers, you'll need an external database:

#### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to SQL Editor and run the schema creation script:

```sql
-- Create the taxi_trips table
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
    tip_percentage DECIMAL(5,2)
);

-- Create indexes for performance
CREATE INDEX idx_pickup_datetime ON taxi_trips(pickup_datetime);
CREATE INDEX idx_payment_type ON taxi_trips(payment_type);
CREATE INDEX idx_pickup_location ON taxi_trips(pickup_location_id);
```

#### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Use the same schema as above

#### Option C: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a free PostgreSQL database
3. Use the same schema as above

### 2. Environment Variables
In Streamlit Cloud, add these environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

### 3. Streamlit Cloud Deployment
1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Connect your GitHub account
3. Select this repository
4. Set the main file path to: `streamlit_app/app.py`
5. Set the Python version to: `3.11`
6. Add your database URL as an environment variable
7. Deploy!

## File Structure for Streamlit Cloud
```
NYCTaxiData/
├── streamlit_app/
│   ├── app.py              # Main Streamlit app
│   ├── utils.py            # Helper functions
│   └── requirements.txt    # Dependencies
├── .streamlit/
│   └── config.toml        # Streamlit configuration
├── data/
│   └── zones/             # NYC zone data
└── README.md
```

## Important Notes

### Database Connection
- The app expects a PostgreSQL database
- Update the database connection in `streamlit_app/app.py` if needed
- Ensure your database is accessible from Streamlit Cloud

### Data Loading
- For demo purposes, you can populate the database with sample data
- The app will show "No data available" until data is loaded
- Consider adding a data loading script for demo purposes

### Performance
- Streamlit Cloud has memory limitations
- The app is optimized for large datasets with chunked loading
- Consider reducing data size for demo purposes

## Troubleshooting

### Common Issues
1. **Database Connection Error**: Check your DATABASE_URL environment variable
2. **Import Errors**: Ensure all dependencies are in `streamlit_app/requirements.txt`
3. **Memory Issues**: Reduce data size or optimize queries
4. **Deployment Failures**: Check the Streamlit Cloud logs

### Logs
- View deployment logs in Streamlit Cloud dashboard
- Check for any missing dependencies or connection issues

## Demo Data
For demonstration purposes, you can add sample data to your database:

```python
# Sample data insertion script
import pandas as pd
from sqlalchemy import create_engine

# Create sample data
sample_data = pd.DataFrame({
    'pickup_datetime': ['2025-01-01 10:00:00'],
    'dropoff_datetime': ['2025-01-01 10:30:00'],
    'pickup_location_id': [1],
    'dropoff_location_id': [2],
    'trip_distance': [5.2],
    'fare_amount': [15.50],
    'tip_amount': [3.10],
    'total_amount': [18.60],
    'payment_type': [1],
    'trip_duration_minutes': [30],
    'tip_percentage': [20.0]
})

# Insert into database
engine = create_engine('your_database_url')
sample_data.to_sql('taxi_trips', engine, if_exists='append', index=False)
```

## Support
- Check Streamlit documentation: [docs.streamlit.io](https://docs.streamlit.io)
- Streamlit Cloud documentation: [docs.streamlit.io/streamlit-community-cloud](https://docs.streamlit.io/streamlit-community-cloud) 
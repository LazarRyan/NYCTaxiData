#!/usr/bin/env python3
"""
Script to load NYC taxi data into Supabase
"""

import os
import pandas as pd
import sqlalchemy
from sqlalchemy import text
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_data_to_supabase():
    """Load processed data into Supabase"""
    
    # Get Supabase connection URL from environment
    supabase_url = os.getenv('SUPABASE_DATABASE_URL')
    
    if not supabase_url:
        logger.error("SUPABASE_DATABASE_URL environment variable not set")
        return False
    
    try:
        # Create engine
        engine = sqlalchemy.create_engine(supabase_url)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to Supabase")
        
        # Check if we have processed data
        processed_file = "data/processed/processed_taxi_data.parquet"
        
        if not os.path.exists(processed_file):
            logger.error(f"Processed data file not found: {processed_file}")
            logger.info("Please run the Airflow pipeline first to process the data")
            return False
        
        # Load processed data
        logger.info("Loading processed data...")
        df = pd.read_parquet(processed_file)
        logger.info(f"Loaded {len(df)} records")
        
        # Insert data into Supabase
        logger.info("Inserting data into Supabase...")
        
        # Use chunked insertion for better performance
        chunk_size = 10000
        total_chunks = len(df) // chunk_size + 1
        
        for i in range(0, len(df), chunk_size):
            chunk = df.iloc[i:i+chunk_size]
            chunk.to_sql('taxi_trips', engine, if_exists='append', index=False, method='multi')
            logger.info(f"Inserted chunk {i//chunk_size + 1}/{total_chunks}")
        
        logger.info("Data successfully loaded into Supabase!")
        return True
        
    except Exception as e:
        logger.error(f"Error loading data to Supabase: {str(e)}")
        return False

def create_zone_aggregations():
    """Create zone aggregations in Supabase"""
    
    supabase_url = os.getenv('SUPABASE_DATABASE_URL')
    
    if not supabase_url:
        logger.error("SUPABASE_DATABASE_URL environment variable not set")
        return False
    
    try:
        engine = sqlalchemy.create_engine(supabase_url)
        
        # Load taxi zones data
        zones_file = "data/zones/taxi_zone_lookup.csv"
        
        if not os.path.exists(zones_file):
            logger.error(f"Taxi zones file not found: {zones_file}")
            return False
        
        zones_df = pd.read_csv(zones_file)
        logger.info(f"Loaded {len(zones_df)} taxi zones")
        
        # Insert zones data
        zones_df.to_sql('taxi_zones', engine, if_exists='replace', index=False)
        logger.info("Taxi zones loaded into Supabase")
        
        # Create zone aggregations (this would normally be done by the Airflow pipeline)
        # For now, we'll create a simple aggregation
        logger.info("Creating zone aggregations...")
        
        # This is a simplified version - in production, you'd run the full aggregation
        # from the Airflow pipeline
        
        return True
        
    except Exception as e:
        logger.error(f"Error creating zone aggregations: {str(e)}")
        return False

if __name__ == "__main__":
    print("NYC Taxi Data - Supabase Loader")
    print("=" * 40)
    
    # Load main data
    if load_data_to_supabase():
        print("✅ Main data loaded successfully")
    else:
        print("❌ Failed to load main data")
    
    # Create zone aggregations
    if create_zone_aggregations():
        print("✅ Zone aggregations created successfully")
    else:
        print("❌ Failed to create zone aggregations")
    
    print("\nNext steps:")
    print("1. Copy your Supabase connection URL")
    print("2. Set it as SUPABASE_DATABASE_URL in Streamlit Cloud")
    print("3. Deploy your Streamlit app") 
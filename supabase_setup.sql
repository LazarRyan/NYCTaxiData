-- NYC Taxi Data Pipeline - Supabase Database Setup
-- Run this script in your Supabase SQL editor

-- Create the main taxi_trips table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pickup_datetime ON taxi_trips(pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_pickup_location ON taxi_trips(pickup_location_id);
CREATE INDEX IF NOT EXISTS idx_dropoff_location ON taxi_trips(dropoff_location_id);
CREATE INDEX IF NOT EXISTS idx_payment_type ON taxi_trips(payment_type);

-- Create the zone_aggregations table
CREATE TABLE IF NOT EXISTS zone_aggregations (
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

-- Create taxi zones lookup table
CREATE TABLE IF NOT EXISTS taxi_zones (
    location_id INTEGER PRIMARY KEY,
    zone_name VARCHAR(255),
    borough VARCHAR(100)
);

-- Enable Row Level Security (RLS) - optional for public read access
ALTER TABLE taxi_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxi_zones ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to taxi_trips" ON taxi_trips
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to zone_aggregations" ON zone_aggregations
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to taxi_zones" ON taxi_zones
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon; 
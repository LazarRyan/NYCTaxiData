#!/bin/bash

# NYC Taxi Data Pipeline - Supabase Setup
# This script helps you run the Airflow pipeline with Supabase

echo "🚕 NYC Taxi Data Pipeline - Supabase Setup"
echo "=========================================="

# Check if SUPABASE_DATABASE_URL is set
if [ -z "$SUPABASE_DATABASE_URL" ]; then
    echo "❌ SUPABASE_DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it with your Supabase connection URL:"
    echo "export SUPABASE_DATABASE_URL='postgresql://postgres:[YOUR-PASSWORD]@db.dgdqhchrfwcsvzhefyis.supabase.co:5432/postgres'"
    echo ""
    echo "Replace [YOUR-PASSWORD] with your actual Supabase database password"
    exit 1
fi

echo "✅ SUPABASE_DATABASE_URL is set"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 30

echo ""
echo "🌐 Airflow is starting up..."
echo "   - Web UI: http://localhost:8080"
echo "   - Username: airflow"
echo "   - Password: airflow"
echo ""
echo "📊 Streamlit Dashboard: http://localhost:8501"
echo ""
echo "🔧 Next steps:"
echo "1. Wait for Airflow to fully start (check http://localhost:8080)"
echo "2. Go to DAGs and trigger the 'nyc_taxi_pipeline'"
echo "3. The pipeline will download data and process it into Supabase"
echo "4. Your Streamlit app will automatically connect to Supabase"
echo ""
echo "💡 To stop the services:"
echo "   docker-compose down" 
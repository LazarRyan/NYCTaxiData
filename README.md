# NYC Taxi Data Pipeline 🚕

A comprehensive data engineering pipeline that ingests, processes, and visualizes insights from NYC Yellow Taxi Trip data using Apache Airflow, PySpark, PostgreSQL, and Streamlit.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NYC TLC Data  │───▶│  Apache Airflow │───▶│   PySpark Jobs  │───▶│  PostgreSQL DB  │
│   (Parquet)     │    │   (Orchestration)│    │  (Processing)   │    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  Streamlit App  │
                                              │  (Visualization)│
                                              └─────────────────┘
```

## 🚀 Features

- **Automated Data Ingestion**: Downloads NYC taxi data from official TLC sources
- **Data Processing**: PySpark jobs for cleaning, transformation, and feature engineering
- **Data Quality**: Comprehensive data validation and outlier detection
- **Real-time Dashboard**: Interactive Streamlit dashboard with Plotly visualizations
- **Containerized Deployment**: Full Docker setup for easy deployment
- **Scalable Processing**: Distributed processing with Apache Spark
- **Performance Optimized**: Connection pooling, chunked loading, and PostgreSQL indexing

## 📊 Dashboard Features

- **Summary Metrics**: Total trips, average fare, tip percentages, trip duration
- **Hourly Analysis**: Trip patterns by hour of day
- **Revenue Analysis**: Payment type breakdown and tip analysis
- **Distance & Duration**: Distribution analysis of trip characteristics
- **Location Analysis**: Top pickup/dropoff locations with NYC zone mapping
- **Trend Analysis**: Time-series analysis of trip patterns
- **Interactive Filters**: Time period, payment type, and date range filtering
- **Performance Analytics**: Peak performance and location intelligence insights

## 🛠️ Technology Stack

- **Orchestration**: Apache Airflow 2.8.1
- **Processing**: Apache Spark 3.5.0 (PySpark)
- **Database**: PostgreSQL 15
- **Visualization**: Streamlit 1.29.0 + Plotly + Folium
- **Containerization**: Docker + Docker Compose
- **Language**: Python 3.11

## 📁 Project Structure

```
NYCTaxiData/
├── dags/
│   └── nyc_taxi_dag.py          # Airflow DAG for pipeline orchestration
├── streamlit_app/
│   ├── app.py                   # Main Streamlit dashboard application
│   └── utils.py                 # Helper functions and utilities
├── data/
│   ├── raw/                     # Raw downloaded data
│   ├── processed/               # Processed data files
│   └── zones/                   # NYC taxi zone data
├── docker-compose.yml           # Docker services orchestration
├── Dockerfile.airflow           # Airflow container configuration
├── Dockerfile.streamlit         # Streamlit container configuration
├── requirements.txt             # Consolidated Python dependencies
├── requirements.md              # Project requirements
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- At least 8GB RAM available for the full stack
- Internet connection for downloading data

### 1. Clone and Setup

```bash
git clone <repository-url>
cd NYCTaxiData
```

### 2. Start the Pipeline

```bash
# Start all services
docker-compose up -d

# Wait for services to be healthy (2-3 minutes)
docker-compose ps
```

### 3. Access the Applications

- **Airflow Web UI**: http://localhost:8080
  - Username: `airflow`
  - Password: `airflow`
- **Streamlit Dashboard**: http://localhost:8501
- **PostgreSQL**: localhost:5432

### 4. Run the Pipeline

1. Open Airflow UI at http://localhost:8080
2. Navigate to DAGs → `nyc_taxi_pipeline`
3. Click "Trigger DAG" to start the pipeline
4. Monitor the execution in the Airflow UI
5. Once complete, view results in the Streamlit dashboard

## 📈 Pipeline Workflow

### 1. Data Ingestion
- Downloads NYC taxi data from official TLC sources
- Supports monthly data processing
- Handles data format validation

### 2. Data Processing (PySpark)
- **Data Cleaning**: Removes nulls, filters outliers, validates trip data
- **Feature Engineering**: 
  - Trip duration calculation
  - Tip percentage calculation
  - Time-based features (hour, day, weekend flags)
  - Rush hour detection
  - Speed calculation
- **Data Quality**: IQR-based outlier detection for distance and fare
- **Performance**: Optimized Spark SQL queries with proper filtering

### 3. Data Storage
- **PostgreSQL**: Structured storage with indexes for fast queries
- **Schema**: Optimized for analytical queries
- **Performance**: Connection pooling and chunked loading for large datasets

### 4. Visualization
- **Real-time Dashboard**: Auto-refreshing metrics and charts
- **Interactive Charts**: Plotly-powered visualizations
- **Responsive Design**: Mobile-friendly interface
- **NYC Zone Mapping**: Accurate location names and insights

## 🔧 Configuration

### Environment Variables

The following environment variables can be customized:

```bash
# Database
POSTGRES_DB=nyc_taxi_data
POSTGRES_USER=airflow
POSTGRES_PASSWORD=airflow

# Airflow
AIRFLOW__CORE__EXECUTOR=LocalExecutor
AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres/nyc_taxi_data

# Spark Configuration
SPARK_HOME=/opt/bitnami/spark
PYTHONPATH=/opt/bitnami/spark/python

# Streamlit
DATABASE_URL=postgresql://airflow:airflow@postgres:5432/nyc_taxi_data
```

### Data Sources

The pipeline downloads data from NYC TLC official sources:
- **Yellow Taxi Data**: https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page
- **Format**: Parquet files
- **Frequency**: Monthly data processing
- **Scale**: Processes 3.6M+ records efficiently

## 📊 Dashboard Insights

The Streamlit dashboard provides:

1. **Summary Metrics**
   - Total trips processed (3.6M+ records)
   - Average fare and tip percentages
   - Average trip duration
   - Total revenue generated

2. **Hourly Analysis**
   - Trip patterns throughout the day
   - Peak hours identification
   - Fare variations by hour

3. **Revenue Analysis**
   - Payment type breakdown
   - Tip behavior by payment method
   - Revenue trends

4. **Geographic Analysis**
   - Top pickup/dropoff locations with NYC zone names
   - Zone-based insights
   - Location intelligence

5. **Temporal Analysis**
   - Daily/weekly trends
   - Seasonal patterns
   - Performance analytics

6. **Interactive Features**
   - Time period filtering
   - Payment type selection
   - Date range customization
   - Real-time data updates

## 🐛 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs airflow-webserver
   ```

2. **Database connection issues**
   ```bash
   # Wait for PostgreSQL to be ready
   docker-compose logs postgres
   ```

3. **PySpark module errors**
   ```bash
   # Rebuild containers with PySpark
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Memory issues**
   - Increase Docker memory allocation
   - Reduce Spark worker memory in docker-compose.yml

5. **Streamlit performance issues**
   - Data is loaded in chunks with progress tracking
   - Connection pooling is enabled
   - PostgreSQL indexes are created for faster queries

### Logs

View logs for specific services:
```bash
# Airflow logs
docker-compose logs airflow-webserver
docker-compose logs airflow-scheduler

# Streamlit logs
docker-compose logs streamlit

# PostgreSQL logs
docker-compose logs postgres
```

## 🔄 Development

### Adding New Features

1. **New PySpark Jobs**: Add to `dags/nyc_taxi_dag.py`
2. **Dashboard Features**: Extend `streamlit_app/app.py`
3. **Utility Functions**: Add to `streamlit_app/utils.py`
4. **Pipeline Tasks**: Modify `dags/nyc_taxi_dag.py`

### Local Development

```bash
# Start only specific services
docker-compose up postgres airflow-webserver -d

# Run Streamlit locally
pip install -r requirements.txt
streamlit run streamlit_app/app.py
```

## 📝 Data Schema

### Raw Data Schema
- `pickup_datetime`: Trip start time
- `dropoff_datetime`: Trip end time
- `pickup_location_id`: Pickup zone ID
- `dropoff_location_id`: Dropoff zone ID
- `trip_distance`: Distance in miles
- `fare_amount`: Base fare
- `tip_amount`: Tip amount
- `total_amount`: Total fare
- `payment_type`: Payment method code

### Processed Data Schema
Includes all raw fields plus:
- `trip_duration_minutes`: Calculated trip duration
- `tip_percentage`: Calculated tip percentage
- `pickup_hour`: Hour of pickup
- `pickup_day_of_week`: Day of week
- `is_weekend`: Weekend flag
- `is_rush_hour`: Rush hour flag
- `speed_mph`: Calculated speed

## 🎯 Performance Optimizations

### Database Optimizations
- PostgreSQL indexes on frequently queried columns
- Connection pooling for efficient database connections
- Chunked data loading with progress tracking

### Streamlit Optimizations
- Cached data loading with TTL (10 minutes)
- Modular code structure for better maintainability
- Optimized queries for large datasets (3.6M+ records)

### PySpark Optimizations
- Local mode processing for development
- Optimized Spark SQL queries
- Proper environment variable configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NYC Taxi & Limousine Commission for providing the data
- Apache Airflow, Spark, and Streamlit communities
- Open source contributors

---

**Built with ❤️ for data engineering excellence** 
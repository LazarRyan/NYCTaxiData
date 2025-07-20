# NYC Taxi Data Pipeline — Technical Requirements

## Overview
A reproducible data engineering pipeline to ingest, process, and visualize insights from the NYC Yellow Taxi Trip dataset using Apache Airflow, PySpark, PostgreSQL, and Streamlit.

## Project Goals
- ✅ Demonstrate real-world ETL skills
- ✅ Showcase orchestration via Apache Airflow
- ✅ Perform distributed processing using PySpark
- ✅ Deliver a public-facing Streamlit app for insights visualization
- ✅ Handle large-scale data processing (3.6M+ records)
- ✅ Optimize performance with connection pooling and indexing

## Architecture
1. **Data Ingestion** (Airflow)
   - Source: NYC Taxi data from [https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)
   - File format: Parquet
   - Frequency: Monthly data (can batch process a few months)
   - Scale: 3.6M+ records per month

2. **Data Processing** (PySpark)
   - ✅ Cleaning nulls, filtering outliers
   - ✅ Feature engineering: trip distance, duration, tip %, zones
   - ✅ Aggregation by hour/day/week and pickup zone
   - ✅ Optimized Spark SQL queries with proper filtering
   - ✅ Local mode processing for development

3. **Data Storage**
   - ✅ Raw → Local filesystem in Parquet format
   - ✅ Processed → PostgreSQL with optimized indexes
   - ✅ Connection pooling for efficient database access
   - ✅ Chunked loading for large datasets

4. **Frontend Visualization** (Streamlit)
   - ✅ Key metrics:
     - Average trip duration by hour
     - Revenue per zone
     - Tip % by payment type
     - Heatmap of busy pickup/dropoff locations
   - ✅ Interactive filters: Time period, payment type, date range
   - ✅ NYC zone mapping with accurate location names
   - ✅ Performance analytics and location intelligence
   - ✅ Real-time data updates with caching

5. **Orchestration** (Airflow)
   - ✅ DAG runs:
     - `download_data_task`
     - `spark_clean_transform_task`
     - `load_to_db_task`
     - `update_streamlit_metrics_task`

## Tools & Libraries
- ✅ Apache Airflow 2.8.1
- ✅ Apache Spark 3.5.0 (PySpark)
- ✅ Streamlit 1.29.0
- ✅ PostgreSQL 15
- ✅ Pandas 2.1.4 (for Streamlit summaries)
- ✅ Docker + Docker Compose
- ✅ GitHub for version control
- ✅ Plotly 5.17.0 (visualizations)
- ✅ Folium 0.14.0 (maps)

## Folder Structure
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
└── README.md                   # Documentation
```

## Milestones
1. ✅ Setup Airflow locally with Docker
2. ✅ Build DAG for downloading monthly data
3. ✅ Create PySpark cleaning + transformation job
4. ✅ Save to PostgreSQL with optimized schema
5. ✅ Build Streamlit dashboard to consume final output
6. ✅ Deploy dashboard with Docker
7. ✅ Optimize performance for large datasets
8. ✅ Modularize code structure
9. ✅ Add NYC zone mapping and location intelligence
10. ✅ Implement interactive filters and real-time updates

## Performance Achievements
- ✅ **Data Scale**: Successfully processes 3.6M+ records
- ✅ **Loading Speed**: Optimized with connection pooling and chunked loading
- ✅ **Query Performance**: PostgreSQL indexes for fast queries
- ✅ **UI Responsiveness**: Cached data loading with TTL
- ✅ **Code Maintainability**: Modular structure with utils module

## Deployment Status
- ✅ **Dockerized**: Full containerized deployment
- ✅ **Production Ready**: Optimized for large datasets
- ✅ **Documentation**: Comprehensive README and requirements
- ✅ **Clean Code**: Removed unused files and optimized structure

## Success Criteria
- ✅ Fully automated pipeline with reproducible results
- ✅ Visual dashboard accessible via web
- ✅ Efficient Spark transformations with optimizations
- ✅ Clean documentation and codebase for review
- ✅ Handles large-scale data processing
- ✅ Performance optimized for production use

## Technical Improvements Made
1. **Code Cleanup**: Removed unused files and consolidated dependencies
2. **Modularization**: Split large Streamlit app into manageable modules
3. **Performance Optimization**: Added connection pooling, chunked loading, and indexing
4. **NYC Zone Mapping**: Added accurate location names for better insights
5. **Interactive Features**: Added filters and real-time updates
6. **Error Handling**: Improved error handling and troubleshooting guides

## Future Enhancements (Optional)
- ML Model: Tip prediction or fare estimation
- Additional data sources: Uber/Lyft comparison
- Real-time streaming: Kafka integration
- Advanced analytics: Machine learning insights
- Multi-city expansion: Compare with other cities


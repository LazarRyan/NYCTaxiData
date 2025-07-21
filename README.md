# NYC Taxi Analytics Dashboard

A modern, real-time analytics dashboard for NYC Yellow Taxi Trip data, built with Next.js, Apache Airflow, and PostgreSQL.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Apache Airflow │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (ETL Pipeline)│◄──►│   (Database)    │
│   localhost:3000│    │  localhost:8080 │    │   localhost:5432│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Interactive   │    │   PySpark Jobs  │    │   NYC Taxi Data │
│   Dashboard     │    │   (Processing)  │    │   (3.6M+ trips) │
│   - Charts      │    │   - Data Clean  │    │   - Real-time   │
│   - Maps        │    │   - Aggregations│    │   - Historical  │
│   - Metrics     │    │   - Analytics   │    │   - Analytics   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### 📊 **Interactive Dashboard**
- **Real-time Analytics**: Live data visualization with 3.6M+ NYC taxi trips
- **Interactive Charts**: Payment types, fare distributions, trip durations
- **Geographic Maps**: Pickup/dropoff locations with Leaflet.js
- **Key Metrics**: Total trips, revenue, average fares, tip percentages
- **Date Filtering**: Custom date ranges for analysis
- **Responsive Design**: Works on desktop, tablet, and mobile

### 🔄 **Data Pipeline**
- **Automated ETL**: Apache Airflow orchestrates data processing
- **NYC TLC Integration**: Downloads latest taxi data automatically
- **PySpark Processing**: Scalable data transformation and analytics
- **PostgreSQL Storage**: Reliable, fast database for analytics
- **Real-time Updates**: Fresh data processing pipeline

### 🛠️ **Technology Stack**
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Charts**: Plotly.js, React-Plotly
- **Maps**: Leaflet.js, React-Leaflet
- **Backend**: Apache Airflow, PySpark, PostgreSQL
- **Deployment**: Vercel (Frontend), Docker (Backend)

## 📦 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd NYCTaxiData
```

### 2. Start the Data Pipeline
```bash
# Start all services (Airflow, PostgreSQL, Spark)
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### 3. Run the Airflow Pipeline
1. Open Airflow UI: http://localhost:8080
2. Login: `airflow` / `airflow`
3. Enable the `nyc_taxi_pipeline` DAG
4. Trigger the pipeline manually or wait for scheduled runs

### 4. Start the Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Access the Dashboard
- **Dashboard**: http://localhost:3000
- **Airflow UI**: http://localhost:8080
- **Spark Master**: http://localhost:8081

## 📊 Data Overview

The system processes NYC Yellow Taxi Trip data with the following schema:

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key |
| `pickup_datetime` | TIMESTAMP | Trip start time |
| `dropoff_datetime` | TIMESTAMP | Trip end time |
| `pickup_location_id` | INTEGER | Pickup zone (1-265) |
| `dropoff_location_id` | INTEGER | Dropoff zone (1-265) |
| `trip_distance` | DECIMAL | Distance in miles |
| `fare_amount` | DECIMAL | Base fare |
| `tip_amount` | DECIMAL | Tip amount |
| `total_amount` | DECIMAL | Total fare |
| `payment_type` | INTEGER | Payment method (1-4) |
| `trip_duration_minutes` | INTEGER | Trip duration |
| `tip_percentage` | DECIMAL | Tip percentage |
| `created_at` | TIMESTAMP | Record creation time |

## 🔧 Configuration

### Environment Variables
```bash
# Next.js (Frontend)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Airflow (Backend)
SUPABASE_HOST=db.your-project.supabase.co
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your_password
```

### Docker Services
- **Airflow**: ETL pipeline orchestration
- **PostgreSQL**: Primary database
- **Spark Master**: PySpark job coordination
- **Spark Worker**: Data processing

## 📈 Analytics Features

### **Payment Analysis**
- Payment type distribution
- Average fares by payment method
- Tip patterns and percentages

### **Geographic Insights**
- Popular pickup/dropoff zones
- Trip distance analysis
- Zone-to-zone trip patterns

### **Temporal Analysis**
- Hourly/daily trip patterns
- Seasonal trends
- Peak usage times

### **Financial Metrics**
- Revenue analysis
- Tip behavior
- Fare distribution

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Backend (Docker)
```bash
# Deploy to cloud provider
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Project Structure

```
NYCTaxiData/
├── app/                    # Next.js frontend
│   ├── page.tsx           # Main dashboard
│   └── layout.tsx         # App layout
├── components/             # React components
│   ├── DashboardHeader.tsx
│   ├── MetricsGrid.tsx
│   ├── ChartsSection.tsx
│   ├── MapSection.tsx
│   └── FiltersPanel.tsx
├── dags/                  # Airflow DAGs
│   └── nyc_taxi_dag.py   # Main ETL pipeline
├── data/                  # Data storage
│   ├── raw/              # Raw downloaded data
│   └── processed/        # Processed data
├── spark_jobs/           # PySpark processing
├── docker-compose.yml    # Service orchestration
└── README.md            # This file
```

## 🔍 Monitoring

### Airflow Metrics
- DAG execution status
- Task completion rates
- Data processing volumes
- Error rates and logs

### Database Metrics
- Table sizes and growth
- Query performance
- Data freshness
- Storage utilization

### Application Metrics
- Page load times
- User interactions
- Chart rendering performance
- API response times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NYC TLC**: For providing the taxi trip data
- **Apache Airflow**: For ETL orchestration
- **Next.js**: For the modern frontend framework
- **PostgreSQL**: For reliable data storage
- **PySpark**: For scalable data processing

---

**Built with ❤️ for NYC taxi analytics** 
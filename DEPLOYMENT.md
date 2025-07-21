# NYC Taxi Analytics Dashboard - Deployment Guide

This guide covers deployment of the NYC Taxi Analytics Dashboard, which consists of a Next.js frontend and an Apache Airflow + PostgreSQL backend.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Apache Airflow │    │   PostgreSQL    │
│   (Vercel)      │◄──►│   (Docker)      │◄──►│   (Docker)      │
│   Frontend      │    │   Backend       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- Node.js 18+
- Git repository

### 1. Prepare Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration (if connecting directly to PostgreSQL)
NEXT_PUBLIC_DATABASE_URL=postgresql://user:password@host:port/database
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 3. Configure Vercel Settings

In your `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

## 🐳 Backend Deployment (Docker)

### Prerequisites
- Docker and Docker Compose
- 8GB+ RAM available
- Cloud provider (AWS, GCP, Azure, etc.)

### 1. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: nyc_taxi_data
      POSTGRES_USER: airflow
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U airflow -d nyc_taxi_data"]
      interval: 30s
      timeout: 10s
      retries: 3

  airflow:
    build:
      context: .
      dockerfile: Dockerfile.airflow
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:${POSTGRES_PASSWORD}@postgres/nyc_taxi_data
      AIRFLOW__CORE__FERNET_KEY: ${AIRFLOW_FERNET_KEY}
      AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION: 'false'
      AIRFLOW__CORE__LOAD_EXAMPLES: 'false'
      SPARK_HOME: /opt/spark
      PYTHONPATH: /opt/spark/python
    volumes:
      - ./dags:/opt/airflow/dags
      - ./data:/opt/airflow/data
      - ./logs:/opt/airflow/logs
      - ./spark_jobs:/opt/airflow/spark_jobs
    ports:
      - "8080:8080"
    restart: unless-stopped
    command: standalone

  spark-master:
    image: bitnami/spark:3.5
    environment:
      SPARK_MODE: master
      SPARK_RPC_AUTHENTICATION_ENABLED: no
      SPARK_RPC_ENCRYPTION_ENABLED: no
      SPARK_LOCAL_STORAGE_ENCRYPTION_ENABLED: no
      SPARK_SSL_ENABLED: no
    ports:
      - "8081:8080"
      - "7077:7077"
    volumes:
      - ./spark_jobs:/opt/bitnami/spark/jobs
      - ./data:/opt/bitnami/spark/data
    restart: unless-stopped

  spark-worker:
    image: bitnami/spark:3.5
    environment:
      SPARK_MODE: worker
      SPARK_MASTER_URL: spark://spark-master:7077
      SPARK_WORKER_MEMORY: 2G
      SPARK_WORKER_CORES: 2
      SPARK_RPC_AUTHENTICATION_ENABLED: no
      SPARK_RPC_ENCRYPTION_ENABLED: no
      SPARK_LOCAL_STORAGE_ENCRYPTION_ENABLED: no
      SPARK_SSL_ENABLED: no
    depends_on:
      - spark-master
    volumes:
      - ./spark_jobs:/opt/bitnami/spark/jobs
      - ./data:/opt/bitnami/spark/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 2. Environment Variables

Create `.env.prod`:
```bash
# PostgreSQL
POSTGRES_PASSWORD=your_secure_password

# Airflow
AIRFLOW_FERNET_KEY=your_fernet_key

# Database Connection (if using external database)
SUPABASE_HOST=your_supabase_host
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your_supabase_password
```

### 3. Deploy Backend

```bash
# Set environment variables
export $(cat .env.prod | xargs)

# Deploy to cloud provider
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## 🔗 Connecting Frontend to Backend

### Option 1: Direct PostgreSQL Connection

Update your Next.js app to connect directly to PostgreSQL:

```typescript
// lib/database.ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export async function getTaxiData(startDate: string, endDate: string) {
  const query = `
    SELECT * FROM taxi_trips 
    WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
    ORDER BY pickup_datetime DESC
    LIMIT 1000
  `
  const result = await pool.query(query, [startDate, endDate])
  return result.rows
}
```

### Option 2: API Layer

Create an API route in Next.js:

```typescript
// app/api/taxi-data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getTaxiData } from '@/lib/database'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    const data = await getTaxiData(startDate!, endDate!)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use secure, randomly generated passwords
- Rotate credentials regularly

### 2. Network Security
- Use HTTPS for all external connections
- Configure firewall rules appropriately
- Use VPN for database access if needed

### 3. Database Security
- Use strong passwords
- Limit database access to necessary IPs
- Enable SSL for database connections
- Regular backups

## 📊 Monitoring and Maintenance

### 1. Health Checks
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs airflow
docker-compose -f docker-compose.prod.yml logs postgres
```

### 2. Database Maintenance
```bash
# Connect to database
docker exec -it nyctaxidata-postgres-1 psql -U airflow -d nyc_taxi_data

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Airflow Monitoring
- Monitor DAG execution in Airflow UI
- Set up alerts for failed tasks
- Review logs regularly

## 🚨 Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**
   - Check CORS settings
   - Verify environment variables
   - Test database connectivity

2. **Airflow tasks failing**
   - Check PySpark logs
   - Verify data source availability
   - Monitor resource usage

3. **Database connection issues**
   - Verify PostgreSQL is running
   - Check connection string format
   - Test network connectivity

### Performance Optimization

1. **Database**
   - Add appropriate indexes
   - Optimize queries
   - Monitor query performance

2. **Frontend**
   - Implement caching
   - Use pagination for large datasets
   - Optimize bundle size

3. **Backend**
   - Scale Spark workers as needed
   - Monitor memory usage
   - Optimize data processing

## 📈 Scaling Considerations

### Horizontal Scaling
- Add more Spark workers
- Use external PostgreSQL (RDS, etc.)
- Implement load balancing

### Vertical Scaling
- Increase container resources
- Optimize memory allocation
- Use faster storage

### Data Pipeline Scaling
- Implement data partitioning
- Use incremental processing
- Add data quality checks

---

**For support, check the main README.md or create an issue in the repository.** 
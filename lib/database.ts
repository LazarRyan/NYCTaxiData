import { Pool } from 'pg'

// Try connection string first, fallback to individual params
const getPoolConfig = () => {
  // If we have a connection string, use it
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  }
  
  // Otherwise use individual parameters
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'nyc_taxi_data',
    user: process.env.DB_USER || 'airflow',
    password: process.env.DB_PASSWORD || 'airflow',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === 'production' ? { 
      rejectUnauthorized: false
    } : false,
  }
}

// Create a connection pool with better error handling
const pool = new Pool(getPoolConfig())

// Test connection function
export async function testConnection() {
  try {
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Generic query function for custom queries
export async function query(text: string, params: string[] = []) {
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export interface TaxiTrip {
  id: number
  pickup_datetime: string
  dropoff_datetime: string
  pickup_location_id: number
  dropoff_location_id: number
  trip_distance: number
  fare_amount: number
  tip_amount: number
  total_amount: number
  payment_type: number
  trip_duration_minutes: number
  tip_percentage: number
  created_at: string
}

export async function getTaxiData(startDate: string, endDate: string, limit: number = 0): Promise<TaxiTrip[]> {
  let query = `
    SELECT 
      id,
      pickup_datetime,
      dropoff_datetime,
      pickup_location_id,
      dropoff_location_id,
      trip_distance,
      fare_amount,
      tip_amount,
      total_amount,
      payment_type,
      trip_duration_minutes,
      tip_percentage,
      created_at
    FROM taxi_trips 
    WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
    ORDER BY pickup_datetime DESC
  `
  
  const params = [startDate, endDate]
  
  // Only add LIMIT if limit > 0
  if (limit > 0) {
    query += ` LIMIT $3`
    params.push(limit.toString())
  }
  
  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getTaxiStats(startDate: string, endDate: string) {
  const query = `
    SELECT 
      COUNT(*) as total_trips,
      AVG(fare_amount) as avg_fare,
      AVG(tip_amount) as avg_tip,
      AVG(trip_duration_minutes) as avg_duration,
      AVG(tip_percentage) as avg_tip_percentage,
      SUM(total_amount) as total_revenue
    FROM taxi_trips 
    WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
  `
  
  try {
    const result = await pool.query(query, [startDate, endDate])
    return result.rows[0]
  } catch (error) {
    console.error('Database stats query error:', error)
    throw error
  }
}

export async function getPaymentTypeDistribution(startDate: string, endDate: string) {
  const query = `
    SELECT 
      payment_type,
      COUNT(*) as count,
      AVG(fare_amount) as avg_fare,
      AVG(tip_percentage) as avg_tip_percentage
    FROM taxi_trips 
    WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
    GROUP BY payment_type
    ORDER BY payment_type
  `
  
  try {
    const result = await pool.query(query, [startDate, endDate])
    return result.rows
  } catch (error) {
    console.error('Database payment type query error:', error)
    throw error
  }
}

export async function getHourlyDistribution(startDate: string, endDate: string) {
  const query = `
    SELECT 
      EXTRACT(HOUR FROM pickup_datetime) as hour,
      COUNT(*) as trip_count,
      AVG(fare_amount) as avg_fare
    FROM taxi_trips 
    WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
    GROUP BY EXTRACT(HOUR FROM pickup_datetime)
    ORDER BY hour
  `
  
  try {
    const result = await pool.query(query, [startDate, endDate])
    return result.rows
  } catch (error) {
    console.error('Database hourly query error:', error)
    throw error
  }
}

// Close the pool when the application shuts down
process.on('SIGINT', () => {
  pool.end()
})

export default pool 
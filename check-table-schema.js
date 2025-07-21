const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'aws-0-us-east-2.pooler.supabase.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres.dgdqhchrfwcsvzhefyis',
  password: process.env.DB_PASSWORD || 'Forgetmenot19123!',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
});

async function checkTableSchema() {
  try {
    console.log('Connecting to database...');
    
    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'taxi_trips'
      );
    `);
    
    console.log('Table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Get table schema
      const schema = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'taxi_trips'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nTable schema:');
      console.table(schema.rows);
      
      // Get sample data
      const sample = await pool.query(`
        SELECT * FROM taxi_trips LIMIT 1;
      `);
      
      console.log('\nSample row:');
      console.log(sample.rows[0] || 'No data in table');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableSchema(); 
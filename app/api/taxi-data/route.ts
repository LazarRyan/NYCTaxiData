import { NextRequest, NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('API route called');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Database connection failed');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    console.log('Database connection successful, parsing request...');

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '1000');
    const offset = (page - 1) * pageSize;

    console.log('Request parameters:', { startDate, endDate, page, pageSize, offset });

    if (!startDate || !endDate) {
      console.log('Missing startDate or endDate');
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    console.log('Environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      NODE_ENV: process.env.NODE_ENV
    });

    console.log('Executing count query...');
    
    // First, get total count for pagination info
    const countQuery = `
      SELECT COUNT(*) as total
      FROM taxi_trips 
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
    `;
    
    const countResult = await query(countQuery, [startDate, endDate]);
    console.log('Count query result:', countResult.rows);
    
    const totalRecords = parseInt(countResult.rows[0]?.total || '0');
    console.log('Total records:', totalRecords);

    console.log('Executing data query...');
    
    // Then get paginated data
    const dataQuery = `
      SELECT 
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
        tip_percentage
      FROM taxi_trips 
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      ORDER BY pickup_datetime DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await query(dataQuery, [startDate, endDate, pageSize.toString(), offset.toString()]);
    console.log('Data query result rows:', result.rows.length);

    const response = {
      data: result.rows,
      pagination: {
        page,
        pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize),
        hasNextPage: page * pageSize < totalRecords,
        hasPrevPage: page > 1
      }
    };

    console.log('Sending response with', result.rows.length, 'rows');
    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 
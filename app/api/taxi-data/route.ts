import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '1000');
    const offset = (page - 1) * pageSize;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // First, get total count for pagination info
    const countQuery = `
      SELECT COUNT(*) as total
      FROM taxi_trips 
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
    `;
    
    const countResult = await query(countQuery, [startDate, endDate]);
    const totalRecords = parseInt(countResult.rows[0]?.total || '0');

    // Then get paginated data
    const dataQuery = `
      SELECT 
        pickup_datetime,
        dropoff_datetime,
        pickup_location_id,
        dropoff_location_id,
        passenger_count,
        trip_distance,
        fare_amount,
        tip_amount,
        total_amount
      FROM taxi_trips 
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      ORDER BY pickup_datetime DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await query(dataQuery, [startDate, endDate, pageSize.toString(), offset.toString()]);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        page,
        pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize),
        hasNextPage: page * pageSize < totalRecords,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Aggregate daily trip counts, total revenue, and average fare
    const sql = `
      SELECT 
        DATE(pickup_datetime) as day,
        COUNT(*) as trip_count,
        SUM(total_amount) as total_revenue,
        AVG(fare_amount) as avg_fare
      FROM taxi_trips
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      GROUP BY day
      ORDER BY day ASC
    `;
    const result = await query(sql, [startDate, endDate]);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Timeseries API error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeseries data' }, { status: 500 });
  }
} 
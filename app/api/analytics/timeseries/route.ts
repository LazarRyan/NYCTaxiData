export const dynamic = "force-dynamic";
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

    // Aggregate by hour of day for trip counts, total revenue, and total tip
    const sql = `
      SELECT 
        EXTRACT(HOUR FROM pickup_datetime) as hour,
        COUNT(*) as trip_count,
        SUM(total_amount) as total_revenue,
        SUM(tip_amount) as total_tip
      FROM taxi_trips
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      GROUP BY hour
      ORDER BY hour ASC
    `;
    const result = await query(sql, [startDate, endDate]);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Timeseries API error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeseries data' }, { status: 500 });
  }
} 
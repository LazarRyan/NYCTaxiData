export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Query for summary statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_trips,
        AVG(fare_amount) as avg_fare,
        AVG(tip_amount) as avg_tip,
        SUM(total_amount) as total_revenue,
        AVG(trip_distance) as avg_distance
      FROM taxi_trips 
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
    `;
    const statsResult = await query(statsQuery, [startDate, endDate]);
    const stats = statsResult.rows[0];

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summary statistics' }, { status: 500 });
  }
} 
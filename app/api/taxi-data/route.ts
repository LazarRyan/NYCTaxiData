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

    // Query summary stats from the summary table
    const statsQuery = `
      SELECT 
        SUM(total_trips) as total_trips,
        AVG(avg_fare) as avg_fare,
        AVG(avg_tip) as avg_tip,
        SUM(total_revenue) as total_revenue,
        AVG(avg_distance) as avg_distance
      FROM taxi_trip_summary
      WHERE stat_date >= $1 AND stat_date <= $2
    `;
    const statsResult = await query(statsQuery, [startDate.slice(0, 10), endDate.slice(0, 10)]);
    const stats = statsResult.rows[0];

    if (!stats || stats.total_trips === null) {
      return NextResponse.json({ error: 'No summary statistics found for the selected range' }, { status: 404 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summary statistics' }, { status: 500 });
  }
} 
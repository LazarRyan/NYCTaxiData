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

    // Aggregate trip counts and total revenue by pickup zone
    const sql = `
      SELECT pickup_location_id, COUNT(*) as trip_count, SUM(total_amount) as total_revenue
      FROM taxi_trips
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      GROUP BY pickup_location_id
      ORDER BY trip_count DESC
    `;
    const result = await query(sql, [startDate, endDate]);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Zone heatmap API error:', error);
    return NextResponse.json({ error: 'Failed to fetch zone heatmap data' }, { status: 500 });
  }
} 
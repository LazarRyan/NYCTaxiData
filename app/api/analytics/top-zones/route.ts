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

    // Top 10 pickup zones by trip count and revenue
    const pickupSql = `
      SELECT pickup_location_id as zone_id, COUNT(*) as trip_count, SUM(total_amount) as total_revenue
      FROM taxi_trips
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      GROUP BY pickup_location_id
      ORDER BY trip_count DESC
      LIMIT 10
    `;
    const pickupResult = await query(pickupSql, [startDate, endDate]);

    // Top 10 dropoff zones by trip count and revenue
    const dropoffSql = `
      SELECT dropoff_location_id as zone_id, COUNT(*) as trip_count, SUM(total_amount) as total_revenue
      FROM taxi_trips
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      GROUP BY dropoff_location_id
      ORDER BY trip_count DESC
      LIMIT 10
    `;
    const dropoffResult = await query(dropoffSql, [startDate, endDate]);

    return NextResponse.json({
      top_pickups: pickupResult.rows,
      top_dropoffs: dropoffResult.rows
    });
  } catch (error) {
    console.error('Top zones API error:', error);
    return NextResponse.json({ error: 'Failed to fetch top zones data' }, { status: 500 });
  }
} 
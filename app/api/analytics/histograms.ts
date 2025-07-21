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

    // Histogram for trip distance (bin size: 1 mile)
    const distanceSql = `
      SELECT FLOOR(trip_distance) as distance_bin, COUNT(*) as count
      FROM taxi_trips
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      GROUP BY distance_bin
      ORDER BY distance_bin ASC
    `;
    const distanceResult = await query(distanceSql, [startDate, endDate]);

    // Histogram for trip duration (bin size: 5 minutes)
    const durationSql = `
      SELECT FLOOR(trip_duration_minutes / 5) * 5 as duration_bin, COUNT(*) as count
      FROM taxi_trips
      WHERE pickup_datetime >= $1 AND pickup_datetime <= $2
      GROUP BY duration_bin
      ORDER BY duration_bin ASC
    `;
    const durationResult = await query(durationSql, [startDate, endDate]);

    return NextResponse.json({
      distance: distanceResult.rows,
      duration: durationResult.rows
    });
  } catch (error) {
    console.error('Histograms API error:', error);
    return NextResponse.json({ error: 'Failed to fetch histogram data' }, { status: 500 });
  }
} 
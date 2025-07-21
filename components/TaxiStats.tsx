'use client'

import { TaxiTrip } from '@/lib/database'

interface TaxiStatsProps {
  data: TaxiTrip[]
  loading?: boolean
  error?: string | null
}

export default function TaxiStats({ data, loading = false, error = null }: TaxiStatsProps) {
  console.log('TaxiStats data:', data);
  if (loading) {
    return <div className="bg-white rounded-lg shadow-md p-6 text-center">Loading statistics...</div>;
  }
  if (error) {
    return <div className="bg-white rounded-lg shadow-md p-6 text-center text-red-600">{error}</div>;
  }
  if (!data || data.length === 0) {
    return <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">No trip data available for the selected range.</div>;
  }
  const stats = {
    totalTrips: data.length,
    avgFare: data.length > 0 ? data.reduce((sum, trip) => sum + trip.fare_amount, 0) / data.length : 0,
    avgTip: data.length > 0 ? data.reduce((sum, trip) => sum + trip.tip_amount, 0) / data.length : 0,
    totalRevenue: data.reduce((sum, trip) => sum + trip.total_amount, 0),
    avgDistance: data.length > 0 ? data.reduce((sum, trip) => sum + trip.trip_distance, 0) / data.length : 0
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Trip Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalTrips.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Trips</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">${Number(stats.avgFare).toFixed(2)}</div>
          <div className="text-sm text-gray-600">Avg Fare</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">${Number(stats.avgTip).toFixed(2)}</div>
          <div className="text-sm text-gray-600">Avg Tip</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">${Number(stats.totalRevenue).toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-gray-700">
          {Number(stats.avgDistance).toFixed(2)} miles avg distance
        </div>
      </div>
    </div>
  )
} 
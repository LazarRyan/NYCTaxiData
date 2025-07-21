'use client'

interface TaxiStatsProps {
  stats?: {
    total_trips: number;
    avg_fare: number;
    avg_tip: number;
    total_revenue: number;
    avg_distance: number;
  };
  loading?: boolean;
  error?: string | null;
}

export default function TaxiStats({ stats, loading = false, error = null }: TaxiStatsProps) {
  if (loading) {
    return <div className="bg-white rounded-lg shadow-md p-6 text-center">Loading statistics...</div>;
  }
  if (error) {
    return <div className="bg-white rounded-lg shadow-md p-6 text-center text-red-600">{error}</div>;
  }
  if (!stats) {
    return <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">No trip data available for the selected range.</div>;
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Trip Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{Number(stats.total_trips).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Trips</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">${Number(stats.avg_fare).toFixed(2)}</div>
          <div className="text-sm text-gray-600">Avg Fare</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">${Number(stats.avg_tip).toFixed(2)}</div>
          <div className="text-sm text-gray-600">Avg Tip</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">${Number(stats.total_revenue).toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-gray-700">
          {Number(stats.avg_distance).toFixed(2)} miles avg distance
        </div>
      </div>
    </div>
  );
} 
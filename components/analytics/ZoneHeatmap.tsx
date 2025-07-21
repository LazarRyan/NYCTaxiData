import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });

interface ZoneHeatmapDatum {
  pickup_location_id: number;
  trip_count: string;
  total_revenue: string;
}

export default function ZoneHeatmap({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<ZoneHeatmapDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/zone-heatmap?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => setError('Failed to load heatmap data'))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Zone Heatmap</h2>
      {loading && <div>Loading heatmap...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="h-96 rounded-lg overflow-hidden">
          {/* Placeholder for Leaflet map. Replace with zone polygons and coloring logic. */}
          <MapContainer center={[40.7128, -74.006]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">NYC zones will be colored by trip count or revenue. (Coming soon!)</div>
    </div>
  );
} 
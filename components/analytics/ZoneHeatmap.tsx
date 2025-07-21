import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';

interface ZoneHeatmapDatum {
  pickup_location_id: number;
  trip_count: string;
  total_revenue: string;
}

function getColor(count: number, max: number) {
  // Blue (low) to Red (high)
  const percent = max ? count / max : 0;
  const r = Math.round(255 * percent);
  const g = Math.round(100 * (1 - percent));
  const b = Math.round(255 * (1 - percent));
  return `rgb(${r},${g},${b})`;
}

export default function ZoneHeatmap({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<ZoneHeatmapDatum[]>([]);
  const [geojson, setGeojson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/zone-heatmap?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => setError('Failed to load heatmap data'));
    fetch('/nyu-2451-36743-geojson.json')
      .then(res => res.json())
      .then(setGeojson)
      .catch(() => setError('Failed to load zone polygons'))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // Map location_id to trip data
  const zoneStats = useMemo(() => {
    const map = new Map<number, ZoneHeatmapDatum>();
    data.forEach(d => map.set(Number(d.pickup_location_id), d));
    return map;
  }, [data]);
  const maxTrips = useMemo(() => Math.max(...data.map(d => Number(d.trip_count) || 0), 1), [data]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Zone Heatmap</h2>
      {loading && <div>Loading heatmap...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && geojson && (
        <div className="h-96 rounded-lg overflow-hidden">
          <MapContainer center={[40.7128, -74.006]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <GeoJSON
              data={geojson}
              style={feature => {
                if (!feature) return {};
                const id = feature.properties.locationid;
                const stat = zoneStats.get(Number(id));
                const count = stat ? Number(stat.trip_count) : 0;
                return {
                  fillColor: getColor(count, maxTrips),
                  color: '#333',
                  weight: 1,
                  fillOpacity: 0.7,
                };
              }}
              onEachFeature={(feature, layer) => {
                const id = feature.properties.locationid;
                const stat = zoneStats.get(Number(id));
                const name = feature.properties.zone;
                const borough = feature.properties.borough;
                const count = stat ? Number(stat.trip_count) : 0;
                const revenue = stat ? Number(stat.total_revenue).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0';
                layer.bindTooltip(
                  `<strong>${name}, ${borough}</strong><br/>Trips: ${count}<br/>Revenue: ${revenue}`,
                  { sticky: true }
                );
              }}
            />
          </MapContainer>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">NYC zones colored by trip count. Hover for details.</div>
    </div>
  );
} 
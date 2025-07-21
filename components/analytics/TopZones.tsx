'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getLocationName } from '@/lib/locationMapping';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TopZoneDatum {
  zone_id: number;
  zone_name?: string;
  trip_count: string;
  total_revenue: string;
}

export default function TopZones({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [pickups, setPickups] = useState<TopZoneDatum[]>([]);
  const [dropoffs, setDropoffs] = useState<TopZoneDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/top-zones?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(res => {
        setPickups(res.top_pickups);
        setDropoffs(res.top_dropoffs);
      })
      .catch(err => setError('Failed to load top zones data'))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // Find max y for both charts
  const maxPickup = Math.max(...pickups.map(d => Number(d.trip_count) || 0), 0);
  const maxDropoff = Math.max(...dropoffs.map(d => Number(d.trip_count) || 0), 0);
  const maxY = Math.max(maxPickup, maxDropoff);

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-0">
      <h2 className="text-xl font-semibold mb-4">Top Pickup & Dropoff Zones</h2>
      {loading && <div>Loading top zones...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Plot
            data={[
              {
                x: pickups.map(d => d.zone_name || getLocationName(d.zone_id)),
                y: pickups.map(d => Number(d.trip_count)),
                type: 'bar',
                marker: { color: '#3b82f6' },
                name: 'Pickups'
              }
            ]}
            layout={{
              title: { text: 'Top Pickup Zones' },
              height: typeof window !== 'undefined' && window.innerWidth < 640 ? 250 : 500,
              width: undefined,
              margin: { l: 50, r: 30, t: 40, b: 80 },
              xaxis: {
                title: { text: 'Zone' },
                tickangle: 45,
                tickfont: { size: 10 },
              },
              yaxis: { title: { text: 'Trips' }, range: [0, maxY] },
            }}
            config={{ responsive: true }}
          />
          <Plot
            data={[
              {
                x: dropoffs.map(d => d.zone_name || getLocationName(d.zone_id)),
                y: dropoffs.map(d => Number(d.trip_count)),
                type: 'bar',
                marker: { color: '#10b981' },
                name: 'Dropoffs'
              }
            ]}
            layout={{
              title: { text: 'Top Dropoff Zones' },
              height: typeof window !== 'undefined' && window.innerWidth < 640 ? 250 : 500,
              width: undefined,
              margin: { l: 50, r: 30, t: 40, b: 80 },
              xaxis: {
                title: { text: 'Zone' },
                tickangle: 45,
                tickfont: { size: 10 },
              },
              yaxis: { title: { text: 'Trips' }, range: [0, maxY] },
            }}
            config={{ responsive: true }}
          />
        </div>
      )}
    </div>
  );
} 
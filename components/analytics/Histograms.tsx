'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface HistogramDatum {
  distance_bin?: number;
  duration_bin?: number;
  count: string;
}

export default function Histograms({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [distance, setDistance] = useState<HistogramDatum[]>([]);
  const [duration, setDuration] = useState<HistogramDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/histograms?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(res => {
        setDistance(res.distance);
        setDuration(res.duration);
      })
      .catch(err => setError('Failed to load histogram data'))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Trip Distance & Duration Histograms</h2>
      {loading && <div>Loading histograms...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Plot
            data={[
              {
                x: distance.map(d => d.distance_bin).filter((v): v is number => v !== undefined && v <= 40),
                y: distance.filter(d => d.distance_bin !== undefined && d.distance_bin <= 40).map(d => Number(d.count)),
                type: 'bar',
                marker: { color: '#3b82f6' },
                name: 'Distance (mi)'
              }
            ]}
            layout={{
              title: { text: 'Trip Distance Histogram' },
              xaxis: { title: { text: 'Distance (mi, binned)' }, range: [0, 40] },
              yaxis: { title: { text: 'Trips' } },
              height: 400,
              margin: { l: 50, r: 30, t: 40, b: 50 },
            }}
            config={{ displayModeBar: false }}
          />
          <Plot
            data={[
              {
                x: duration.map(d => d.duration_bin).filter((v): v is number => v !== undefined),
                y: duration.map(d => Number(d.count)),
                type: 'bar',
                marker: { color: '#f59e42' },
                name: 'Duration (min)'
              }
            ]}
            layout={{
              title: { text: 'Trip Duration Histogram' },
              xaxis: { title: { text: 'Duration (min, binned)' } },
              yaxis: { title: { text: 'Trips' } },
              height: 400,
              margin: { l: 50, r: 30, t: 40, b: 50 },
            }}
            config={{ displayModeBar: false }}
          />
        </div>
      )}
    </div>
  );
} 
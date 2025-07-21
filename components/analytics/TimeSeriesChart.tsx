'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface HourlyDatum {
  hour: string;
  trip_count: string;
  total_revenue: string;
  total_tip: string;
}

export default function TimeSeriesChart({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<HourlyDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/timeseries?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => setError('Failed to load timeseries data'))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const hours = data.map(d => Number(d.hour));
  const tripCounts = data.map(d => Number(d.trip_count));
  const revenues = data.map(d => Number(d.total_revenue));
  const tips = data.map(d => Number(d.total_tip));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Trips, Revenue & Tips by Hour of Day</h2>
      {loading && <div>Loading hourly data...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <Plot
          data={[
            { x: hours, y: tripCounts, type: 'bar', name: 'Trips', marker: { color: '#3b82f6' } },
            { x: hours, y: revenues, type: 'bar', name: 'Revenue', marker: { color: '#10b981' }, yaxis: 'y2' },
            { x: hours, y: tips, type: 'scatter', mode: 'lines+markers', name: 'Tips', yaxis: 'y3', line: { color: '#f59e42', width: 3, dash: 'dot' } },
          ]}
          layout={{
            barmode: 'group',
            xaxis: { title: { text: 'Hour of Day' }, dtick: 1 },
            yaxis: { title: { text: 'Trips' }, side: 'left' },
            yaxis2: { title: { text: 'Revenue ($)' }, overlaying: 'y', side: 'right', showgrid: false },
            yaxis3: { title: { text: 'Tips ($)' }, overlaying: 'y', side: 'right', position: 0.95, showgrid: false },
            legend: { orientation: 'h' },
            height: 450,
            width: undefined,
            margin: { l: 20, r: 20, t: 20, b: 50 },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
} 
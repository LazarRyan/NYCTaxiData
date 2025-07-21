import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TimeseriesDatum {
  day: string;
  trip_count: string;
  total_revenue: string;
  avg_fare: string;
}

export default function TimeSeriesChart({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<TimeseriesDatum[]>([]);
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

  const days = data.map(d => d.day);
  const tripCounts = data.map(d => Number(d.trip_count));
  const revenues = data.map(d => Number(d.total_revenue));
  const avgFares = data.map(d => Number(d.avg_fare));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Trips & Revenue Over Time</h2>
      {loading && <div>Loading timeseries...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <Plot
          data={[
            { x: days, y: tripCounts, type: 'scatter', mode: 'lines+markers', name: 'Trips', line: { color: '#3b82f6' } },
            { x: days, y: revenues, type: 'scatter', mode: 'lines+markers', name: 'Revenue', yaxis: 'y2', line: { color: '#10b981' } },
            { x: days, y: avgFares, type: 'scatter', mode: 'lines+markers', name: 'Avg Fare', yaxis: 'y3', line: { color: '#f59e42' } },
          ]}
          layout={{
            title: { text: '' },
            xaxis: { title: { text: 'Date' } },
            yaxis: { title: { text: 'Trips' }, side: 'left' },
            yaxis2: { title: { text: 'Revenue ($)' }, overlaying: 'y', side: 'right' },
            yaxis3: { title: { text: 'Avg Fare ($)' }, overlaying: 'y', side: 'right', position: 0.95 },
            legend: { orientation: 'h' },
            height: 350,
            margin: { l: 50, r: 50, t: 20, b: 50 },
          }}
          config={{ displayModeBar: false }}
        />
      )}
    </div>
  );
} 
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PaymentTypeDatum {
  payment_type: number;
  trip_count: string;
  total_revenue: string;
}

const paymentTypeLabels: Record<number, string> = {
  1: 'Credit Card',
  2: 'Cash',
  3: 'No Charge',
  4: 'Dispute',
  5: 'Unknown',
  6: 'Voided Trip',
};

export default function PaymentTypeChart({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<PaymentTypeDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/payment-types?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => setError('Failed to load payment type data'))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const labels = data.map(d => paymentTypeLabels[d.payment_type] || `Type ${d.payment_type}`);
  const tripCounts = data.map(d => Number(d.trip_count));
  const revenues = data.map(d => Number(d.total_revenue));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Payment Type Breakdown</h2>
      {loading && <div>Loading payment types...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <Plot
          data={[
            { x: labels, y: tripCounts, type: 'bar', name: 'Trips', marker: { color: '#3b82f6' } },
            { x: labels, y: revenues, type: 'bar', name: 'Revenue', marker: { color: '#10b981' }, yaxis: 'y2' },
          ]}
          layout={{
            title: { text: '' },
            barmode: 'group',
            xaxis: { title: { text: 'Payment Type' } },
            yaxis: { title: { text: 'Trips' } },
            yaxis2: { title: { text: 'Revenue ($)' }, overlaying: 'y', side: 'right' },
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
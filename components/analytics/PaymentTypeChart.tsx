'use client';

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

  // Filter out payment_type 0 (invalid)
  const filteredData = data.filter(d => d.payment_type !== 0);
  const labels = filteredData.map(d => paymentTypeLabels[d.payment_type] || `Type ${d.payment_type}`);
  const tripCounts = filteredData.map(d => Number(d.trip_count));
  const revenues = filteredData.map(d => Number(d.total_revenue));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Payment Type Breakdown</h2>
      {loading && <div>Loading payment types...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <Plot
          data={[
            {
              labels: labels,
              values: tripCounts,
              type: 'pie',
              textinfo: 'label+percent',
              hoverinfo: 'label+value+percent',
              marker: {
                colors: ['#3b82f6', '#10b981', '#f59e42', '#f43f5e', '#6366f1', '#fbbf24'],
              },
            },
          ]}
          layout={{
            title: { text: '' },
            showlegend: true,
            legend: { orientation: 'h', x: 0.5, xanchor: 'center' },
            height: 400,
            width: undefined,
            margin: { l: 50, r: 30, t: 40, b: 50 },
          }}
          config={{ displayModeBar: false, responsive: true }}
        />
      )}
    </div>
  );
} 
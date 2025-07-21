'use client';
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import TaxiStats from '@/components/TaxiStats';
import ZoneHeatmap from '@/components/analytics/ZoneHeatmap';
import TimeSeriesChart from '@/components/analytics/TimeSeriesChart';
import PaymentTypeChart from '@/components/analytics/PaymentTypeChart';
import Histograms from '@/components/analytics/Histograms';
import TopZones from '@/components/analytics/TopZones';
import { saveAs } from 'file-saver';

// Helper function to get default date range (accounting for NYC TLC data lag)
function getDefaultDateRange() {
  const now = new Date();
  // NYC TLC data is typically available 2-3 months after the actual month
  // For demo purposes, let's use a recent available month (e.g., 3 months ago)
  const endDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); // Start of 3 months ago
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1); // Start of that month
  return {
    startDate: startDate.toISOString(),
    endDate: new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString() // End of that month
  };
}

export default function Home() {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      const response = await fetch(`/api/taxi-data?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setStats(result.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const handleDateChange = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header is now in layout.tsx */}
        {/* Date Range Selector */}
        <div className="filter-container">
          <h2 className="text-xl font-semibold mb-4 text-white">Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate.slice(0, 16)}
                onChange={(e) => setStartDate(new Date(e.target.value).toISOString())}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                End Date
              </label>
              <input
                type="datetime-local"
                value={endDate.slice(0, 16)}
                onChange={(e) => setEndDate(new Date(e.target.value).toISOString())}
                className="input-modern w-full"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleDateChange}
                className="btn-primary w-full transition-card"
              >
                Update Data
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Note: NYC TLC data typically lags by 2-3 months. Default range shows available data from 3 months ago.
          </p>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="transition-card animate-fade-in">
            <TaxiStats stats={stats} loading={loading} error={error} />
          </div>
          <div className="transition-card animate-fade-in delay-100">
            <ZoneHeatmap startDate={startDate} endDate={endDate} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="transition-card animate-fade-in delay-200">
            <TimeSeriesChart startDate={startDate} endDate={endDate} />
          </div>
          <div className="transition-card animate-fade-in delay-300">
            <PaymentTypeChart startDate={startDate} endDate={endDate} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="transition-card animate-fade-in delay-400">
            <Histograms startDate={startDate} endDate={endDate} />
          </div>
          <div className="transition-card animate-fade-in delay-500">
            <TopZones startDate={startDate} endDate={endDate} />
          </div>
        </div>
      </div>
    </div>
  );
} 
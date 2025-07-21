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

// Hardcoded available date range for now (from Supabase SQL results)
const AVAILABLE_START_DATE = '2025-04-01T00:00:00Z';
const AVAILABLE_END_DATE = '2025-04-30T23:59:59Z';

export default function Home() {
  // Use the available date range as the fixed range
  const [startDate] = useState(AVAILABLE_START_DATE);
  const [endDate] = useState(AVAILABLE_END_DATE);
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

  // Format the date range for display
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const displayRange = `${formatDate(startDate)} – ${formatDate(endDate)}`;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow">NYC Taxi Data Dashboard</h1>
          <div className="text-lg text-gray-200 font-medium drop-shadow">Data shown: {displayRange}</div>
        </div>
        <div className="flex flex-col gap-8 mb-8">
          <div className="transition-card animate-fade-in">
            <TaxiStats stats={stats} loading={loading} error={error} />
          </div>
          <div className="transition-card animate-fade-in">
            <ZoneHeatmap startDate={startDate} endDate={endDate} />
          </div>
        </div>
        {/* TimeSeriesChart: full width row */}
        <div className="mb-8">
          <div className="transition-card animate-fade-in delay-200">
            <TimeSeriesChart startDate={startDate} endDate={endDate} />
          </div>
        </div>
        {/* PaymentTypeChart: full width row, centered on large screens */}
        <div className="mb-8 flex justify-center">
          <div className="transition-card animate-fade-in delay-300 w-full max-w-2xl">
            <PaymentTypeChart startDate={startDate} endDate={endDate} />
          </div>
        </div>
        {/* Histograms: two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="transition-card animate-fade-in delay-400">
            <Histograms startDate={startDate} endDate={endDate} />
          </div>
          {/* TopZones: two-column grid */}
          <div className="transition-card animate-fade-in delay-500">
            <TopZones startDate={startDate} endDate={endDate} />
          </div>
        </div>
      </div>
    </div>
  );
} 
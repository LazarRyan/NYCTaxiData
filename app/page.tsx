'use client';

import { useState, useEffect } from 'react';
import TaxiStats from '@/components/TaxiStats';
import ZoneHeatmap from '@/components/analytics/ZoneHeatmap';
import TimeSeriesChart from '@/components/analytics/TimeSeriesChart';
import PaymentTypeChart from '@/components/analytics/PaymentTypeChart';
import Histograms from '@/components/analytics/Histograms';
import TopZones from '@/components/analytics/TopZones';
import { TaxiTrip } from '@/lib/database';

interface ApiResponse {
  data: TaxiTrip[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

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
  const [data, setData] = useState<TaxiTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ApiResponse['pagination'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(1000);

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/taxi-data?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      setData(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleDateChange = () => {
    setCurrentPage(1);
    fetchData(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          NYC Taxi Analytics Dashboard
        </h1>
        
        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate.slice(0, 16)}
                onChange={(e) => setStartDate(new Date(e.target.value).toISOString())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="datetime-local"
                value={endDate.slice(0, 16)}
                onChange={(e) => setEndDate(new Date(e.target.value).toISOString())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleDateChange}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
          <TaxiStats data={data} />
          <ZoneHeatmap startDate={startDate} endDate={endDate} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TimeSeriesChart startDate={startDate} endDate={endDate} />
          <PaymentTypeChart startDate={startDate} endDate={endDate} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Histograms startDate={startDate} endDate={endDate} />
          <TopZones startDate={startDate} endDate={endDate} />
        </div>

        {/* Data Table (optional, paginated) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Raw Data (Paginated)</h2>
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}
          {!loading && !error && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Pickup</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Dropoff</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Distance</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Fare</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Tip</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Duration (min)</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((trip, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 text-xs">{trip.pickup_location_id}</td>
                      <td className="px-2 py-1 text-xs">{trip.dropoff_location_id}</td>
                      <td className="px-2 py-1 text-xs">{trip.trip_distance}</td>
                      <td className="px-2 py-1 text-xs">{trip.fare_amount}</td>
                      <td className="px-2 py-1 text-xs">{trip.tip_amount}</td>
                      <td className="px-2 py-1 text-xs">{trip.total_amount}</td>
                      <td className="px-2 py-1 text-xs">{trip.payment_type}</td>
                      <td className="px-2 py-1 text-xs">{trip.trip_duration_minutes}</td>
                      <td className="px-2 py-1 text-xs">{trip.pickup_datetime.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && data.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No data found for the selected date range.</p>
            </div>
          )}
          {/* Pagination controls (if needed) */}
          {pagination && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalRecords)} of{' '}
                {pagination.totalRecords} records
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
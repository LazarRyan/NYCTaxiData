'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import TaxiStats from '@/components/TaxiStats'
import PaymentTypeChart from '@/components/PaymentTypeChart'
import HourlyChart from '@/components/HourlyChart'
import MapSection from '@/components/MapSection'
import { TaxiTrip } from '@/lib/database'

interface PaginationInfo {
  page: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ApiResponse {
  data: TaxiTrip[]
  pagination: PaginationInfo
}

export default function Home() {
  const [data, setData] = useState<TaxiTrip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })

  const fetchData = async (page: number = 1, append: boolean = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        startDate: `${dateRange.startDate}T00:00:00.000Z`,
        endDate: `${dateRange.endDate}T23:59:59.999Z`,
        page: page.toString(),
        pageSize: '1000'
      })

      const response = await fetch(`/api/taxi-data?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (append) {
        setData(prev => [...prev, ...result.data])
      } else {
        setData(result.data)
      }
      
      setPagination(result.pagination)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1, false)
  }, [dateRange])

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      fetchData(currentPage + 1, true)
    }
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          NYC Taxi Analytics Dashboard
        </h1>
        
        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Date Range</h2>
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && data.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        )}

        {data.length > 0 && (
          <>
            {/* Data Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Data Summary</h2>
                {pagination && (
                  <div className="text-sm text-gray-600">
                    Showing {data.length} of {pagination.totalRecords} records
                    {pagination.totalPages > 1 && ` (Page ${currentPage} of ${pagination.totalPages})`}
                  </div>
                )}
              </div>
              
              {pagination?.hasNextPage && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More Data'}
                </button>
              )}
            </div>

            {/* Analytics Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <TaxiStats data={data} />
              <PaymentTypeChart data={data} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <HourlyChart data={data} />
              <MapSection data={data} />
            </div>
          </>
        )}
      </div>
    </div>
  )
} 
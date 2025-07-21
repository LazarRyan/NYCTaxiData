'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface ChartsSectionProps {
  data: any[]
  filters: any
}

export default function ChartsSection({ data, filters }: ChartsSectionProps) {
  const [activeTab, setActiveTab] = useState('hourly')

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p className="text-gray-500 text-center">No data available for the selected filters</p>
      </div>
    )
  }

  const tabs = [
    { id: 'hourly', label: 'Hourly Analysis' },
    { id: 'revenue', label: 'Revenue Analysis' },
    { id: 'distance', label: 'Distance Analysis' },
    { id: 'payment', label: 'Payment Types' }
  ]

  return (
    <div className="chart-container">
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-96"
      >
        {activeTab === 'hourly' && <HourlyChart data={data} />}
        {activeTab === 'revenue' && <RevenueChart data={data} />}
        {activeTab === 'distance' && <DistanceChart data={data} />}
        {activeTab === 'payment' && <PaymentChart data={data} />}
      </motion.div>
    </div>
  )
}

function HourlyChart({ data }: { data: any[] }) {
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourTrips = data.filter(trip => {
      const pickupHour = new Date(trip.pickup_datetime).getHours()
      return pickupHour === hour
    })
    return {
      hour,
      count: hourTrips.length,
      avgFare: hourTrips.length > 0 
        ? hourTrips.reduce((sum, trip) => sum + trip.fare_amount, 0) / hourTrips.length 
        : 0
    }
  })

  const plotData = [
    {
      x: hourlyData.map(d => d.hour),
      y: hourlyData.map(d => d.count),
      type: 'bar' as const,
      name: 'Trip Count',
      marker: { color: '#3b82f6' }
    },
    {
      x: hourlyData.map(d => d.hour),
      y: hourlyData.map(d => d.avgFare),
      type: 'scatter' as const,
      name: 'Avg Fare',
      yaxis: 'y2',
      marker: { color: '#ef4444' }
    }
  ]

  const layout = {
    title: 'Hourly Trip Analysis',
    xaxis: { title: 'Hour of Day' },
    yaxis: { title: 'Trip Count' },
    yaxis2: { title: 'Average Fare ($)', overlaying: 'y', side: 'right' },
    height: 350,
    margin: { l: 50, r: 50, t: 50, b: 50 }
  }

  return <Plot data={plotData} layout={layout} config={{ displayModeBar: false }} />
}

function RevenueChart({ data }: { data: any[] }) {
  const revenueData = data.reduce((acc, trip) => {
    const date = new Date(trip.pickup_datetime).toISOString().split('T')[0]
    if (!acc[date]) acc[date] = { revenue: 0, trips: 0 }
    acc[date].revenue += trip.fare_amount
    acc[date].trips += 1
    return acc
  }, {} as Record<string, { revenue: number, trips: number }>)

  const dates = Object.keys(revenueData).sort()
  const revenues = dates.map(date => revenueData[date].revenue)

  const plotData = [{
    x: dates,
    y: revenues,
    type: 'scatter' as const,
    mode: 'lines+markers' as const,
    name: 'Daily Revenue',
    line: { color: '#10b981' }
  }]

  const layout = {
    title: 'Daily Revenue Trend',
    xaxis: { title: 'Date' },
    yaxis: { title: 'Revenue ($)' },
    height: 350,
    margin: { l: 50, r: 50, t: 50, b: 50 }
  }

  return <Plot data={plotData} layout={layout} config={{ displayModeBar: false }} />
}

function DistanceChart({ data }: { data: any[] }) {
  const distances = data.map(trip => trip.trip_distance)
  
  const plotData = [{
    x: distances,
    type: 'histogram' as const,
    name: 'Trip Distance Distribution',
    marker: { color: '#8b5cf6' },
    nbinsx: 20
  }]

  const layout = {
    title: 'Trip Distance Distribution',
    xaxis: { title: 'Distance (miles)' },
    yaxis: { title: 'Frequency' },
    height: 350,
    margin: { l: 50, r: 50, t: 50, b: 50 }
  }

  return <Plot data={plotData} layout={layout} config={{ displayModeBar: false }} />
}

function PaymentChart({ data }: { data: any[] }) {
  const paymentLabels = {
    1: 'Credit Card',
    2: 'Cash', 
    3: 'No Charge',
    4: 'Dispute',
    5: 'Unknown',
    6: 'Voided Trip'
  }

  const paymentCounts = data.reduce((acc, trip) => {
    const paymentType = trip.payment_type
    const label = paymentLabels[paymentType as keyof typeof paymentLabels] || `Type ${paymentType}`
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const plotData = [{
    values: Object.values(paymentCounts),
    labels: Object.keys(paymentCounts),
    type: 'pie' as const,
    name: 'Payment Types',
    marker: {
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316']
    }
  }]

  const layout = {
    title: 'Payment Type Distribution',
    height: 350,
    margin: { l: 50, r: 50, t: 50, b: 50 }
  }

  return <Plot data={plotData} layout={layout} config={{ displayModeBar: false }} />
} 
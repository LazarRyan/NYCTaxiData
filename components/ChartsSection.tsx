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
  const [activeChart, setActiveChart] = useState('hourly')

  const charts = [
    { id: 'hourly', name: 'Hourly Analysis', component: HourlyChart },
    { id: 'revenue', name: 'Revenue Trend', component: RevenueChart },
    { id: 'distance', name: 'Distance Distribution', component: DistanceChart },
    { id: 'payment', name: 'Payment Types', component: PaymentChart }
  ]

  const ActiveChartComponent = charts.find(chart => chart.id === activeChart)?.component || HourlyChart

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Analytics Charts</h2>
      
      {/* Chart Type Selector */}
      <div className="flex space-x-2 mb-6">
        {charts.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeChart === chart.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {chart.name}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <motion.div
        key={activeChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <ActiveChartComponent data={data} />
      </motion.div>
    </div>
  )
}

function HourlyChart({ data }: { data: any[] }) {
  const hourlyData = data.reduce((acc, trip) => {
    const hour = new Date(trip.pickup_datetime).getHours()
    if (!acc[hour]) acc[hour] = { count: 0, totalFare: 0 }
    acc[hour].count += 1
    acc[hour].totalFare += Number(trip.fare_amount)
    return acc
  }, {} as Record<number, { count: number, totalFare: number }>)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const counts = hours.map(hour => hourlyData[hour]?.count || 0)
  const avgFares = hours.map(hour => 
    hourlyData[hour]?.count ? hourlyData[hour].totalFare / hourlyData[hour].count : 0
  )

  const plotData = [
    {
      x: hours,
      y: counts,
      type: 'bar' as const,
      name: 'Trip Count',
      marker: { color: '#3b82f6' }
    },
    {
      x: hours,
      y: avgFares,
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Average Fare',
      yaxis: 'y2',
      line: { color: '#ef4444' }
    }
  ]

  const layout = {
    title: { text: 'Hourly Trip Analysis' },
    xaxis: { title: { text: 'Hour of Day' } },
    yaxis: { title: { text: 'Trip Count' } },
    yaxis2: { 
      title: { text: 'Average Fare ($)' }, 
      overlaying: 'y' as const, 
      side: 'right' as const
    },
    height: 350,
    margin: { l: 50, r: 50, t: 50, b: 50 }
  }

  return <Plot data={plotData} layout={layout} config={{ displayModeBar: false }} />
}

function RevenueChart({ data }: { data: any[] }) {
  const revenueData = data.reduce((acc, trip) => {
    const date = new Date(trip.pickup_datetime).toISOString().split('T')[0]
    if (!acc[date]) acc[date] = { revenue: 0, trips: 0 }
    acc[date].revenue += Number(trip.fare_amount)
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
    title: { text: 'Daily Revenue Trend' },
    xaxis: { title: { text: 'Date' } },
    yaxis: { title: { text: 'Revenue ($)' } },
    height: 350,
    margin: { l: 50, r: 50, t: 50, b: 50 }
  }

  return <Plot data={plotData} layout={layout} config={{ displayModeBar: false }} />
}

function DistanceChart({ data }: { data: any[] }) {
  const distances = data.map(trip => Number(trip.trip_distance)).filter(Boolean)
  
  const plotData = [{
    x: distances,
    type: 'histogram' as const,
    name: 'Trip Distance Distribution',
    marker: { color: '#8b5cf6' },
    nbinsx: 20
  }]

  const layout = {
    title: { text: 'Trip Distance Distribution' },
    xaxis: { title: { text: 'Distance (miles)' } },
    yaxis: { title: { text: 'Frequency' } },
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
    const type = trip.payment_type || 'Unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const plotData = [{
    values: Object.values(paymentCounts) as number[],
    labels: Object.keys(paymentCounts),
    type: 'pie' as const,
    name: 'Payment Types',
    marker: {
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316']
    }
  }]

  const layout = {
    title: { text: 'Payment Type Distribution' },
    height: 350,
    margin: { l: 50, r: 50, t: 50, b: 50 }
  }

  return <Plot data={plotData} layout={layout} config={{ displayModeBar: false }} />
} 
'use client'

import { motion } from 'framer-motion'
import { formatCurrency, formatNumber } from '@/utils/formatters'

interface MetricsGridProps {
  data: any[]
}

export default function MetricsGrid({ data }: MetricsGridProps) {
  if (!data || data.length === 0) {
    return null
  }

  const metrics = calculateMetrics(data)

  const metricCards = [
    {
      title: 'Total Trips',
      value: formatNumber(metrics.totalTrips),
      icon: '🚕',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: '💰',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Average Fare',
      value: formatCurrency(metrics.averageFare),
      icon: '📊',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Average Tip',
      value: formatCurrency(metrics.averageTip),
      icon: '💡',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Total Distance',
      value: `${formatNumber(metrics.totalDistance)} mi`,
      icon: '🛣️',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Avg Trip Duration',
      value: `${Math.round(metrics.averageDuration)} min`,
      icon: '⏱️',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metricCards.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`metric-card bg-gradient-to-br ${metric.color}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-label">{metric.title}</div>
              <div className="metric-value">{metric.value}</div>
            </div>
            <div className="text-3xl">{metric.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function calculateMetrics(data: any[]) {
  const totalTrips = data.length
  const totalRevenue = data.reduce((sum, trip) => sum + (trip.total_amount || trip.fare_amount), 0)
  const totalFare = data.reduce((sum, trip) => sum + trip.fare_amount, 0)
  const totalTip = data.reduce((sum, trip) => sum + trip.tip_amount, 0)
  const totalDistance = data.reduce((sum, trip) => sum + trip.trip_distance, 0)
  
  const averageFare = totalFare / totalTrips
  const averageTip = totalTip / totalTrips
  // Use trip_duration_minutes if available, otherwise calculate from timestamps
  const averageDuration = data.reduce((sum, trip) => {
    if (trip.trip_duration_minutes) {
      return sum + trip.trip_duration_minutes
    } else {
      const pickup = new Date(trip.pickup_datetime)
      const dropoff = new Date(trip.dropoff_datetime)
      return sum + (dropoff.getTime() - pickup.getTime()) / (1000 * 60) // minutes
    }
  }, 0) / totalTrips

  return {
    totalTrips,
    totalRevenue,
    averageFare,
    averageTip,
    totalDistance,
    averageDuration
  }
} 
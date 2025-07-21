'use client'

import { TaxiTrip } from '@/lib/database'

interface HourlyChartProps {
  data: TaxiTrip[]
}

export default function HourlyChart({ data }: HourlyChartProps) {
  const hourlyDistribution = data.reduce((acc, trip) => {
    const hour = new Date(trip.pickup_datetime).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // Fill in missing hours with 0
  for (let hour = 0; hour < 24; hour++) {
    if (!hourlyDistribution[hour]) {
      hourlyDistribution[hour] = 0
    }
  }

  const maxCount = Math.max(...Object.values(hourlyDistribution))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Hourly Trip Distribution</h2>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 24 }, (_, hour) => {
          const count = hourlyDistribution[hour] || 0
          const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0
          const percentage = data.length > 0 ? ((count / data.length) * 100).toFixed(1) : '0.0'
          
          return (
            <div key={hour} className="text-center">
              <div className="text-xs text-gray-600 mb-1">{hour}:00</div>
              <div className="bg-gray-200 rounded-t h-32 flex items-end">
                <div 
                  className="bg-green-500 w-full rounded-t transition-all duration-300"
                  style={{ height: `${barHeight}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {count} ({percentage}%)
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 
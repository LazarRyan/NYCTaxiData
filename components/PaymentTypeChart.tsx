'use client'

import { TaxiTrip } from '@/lib/database'

interface PaymentTypeChartProps {
  data: TaxiTrip[]
}

export default function PaymentTypeChart({ data }: PaymentTypeChartProps) {
  const paymentTypes = {
    1: 'Credit Card',
    2: 'Cash',
    3: 'No Charge',
    4: 'Dispute',
    5: 'Unknown',
    6: 'Voided Trip'
  }

  const paymentDistribution = data.reduce((acc, trip) => {
    const type = paymentTypes[trip.payment_type as keyof typeof paymentTypes] || 'Unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const maxCount = Math.max(...Object.values(paymentDistribution))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Type Distribution</h2>
      <div className="space-y-3">
        {Object.entries(paymentDistribution).map(([type, count]) => {
          const percentage = ((count / data.length) * 100).toFixed(1)
          const barWidth = (count / maxCount) * 100
          
          return (
            <div key={type} className="flex items-center space-x-3">
              <div className="w-24 text-sm font-medium text-gray-700">{type}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {count} ({percentage}%)
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 
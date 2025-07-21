'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FiltersPanelProps {
  filters: {
    startDate: Date
    endDate: Date
    paymentType: string
    minFare: number
    maxFare: number
  }
  onFiltersChange: (filters: any) => void
}

export default function FiltersPanel({ filters, onFiltersChange }: FiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ [field]: new Date(value) })
  }

  const handlePaymentTypeChange = (value: string) => {
    onFiltersChange({ paymentType: value })
  }

  const handleFareChange = (field: 'minFare' | 'maxFare', value: number) => {
    onFiltersChange({ [field]: value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="filter-container"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-secondary"
        >
          {isExpanded ? 'Hide' : 'Show'} Advanced Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate.toISOString().split('T')[0]}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate.toISOString().split('T')[0]}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Type
          </label>
          <select
            value={filters.paymentType}
            onChange={(e) => handlePaymentTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Payment Types</option>
            <option value="credit_card">Credit Card</option>
            <option value="cash">Cash</option>
            <option value="no_charge">No Charge</option>
            <option value="dispute">Dispute</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Actions
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const endDate = new Date()
                const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
                onFiltersChange({ startDate, endDate })
              }}
              className="btn-secondary text-xs"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                const endDate = new Date()
                const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
                onFiltersChange({ startDate, endDate })
              }}
              className="btn-secondary text-xs"
            >
              Last 30 Days
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Fare ($)
              </label>
              <input
                type="number"
                min="0"
                value={filters.minFare}
                onChange={(e) => handleFareChange('minFare', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Fare ($)
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxFare}
                onChange={(e) => handleFareChange('maxFare', parseFloat(e.target.value) || 1000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 
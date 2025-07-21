'use client'

import { motion } from 'framer-motion'

export default function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <h1 className="main-header">
        NYC Taxi Analytics Dashboard
      </h1>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Interactive analytics and insights from NYC Yellow Taxi Trip data. 
        Explore trip patterns, revenue analysis, and location intelligence.
      </p>
    </motion.div>
  )
} 
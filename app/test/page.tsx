'use client'

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gradient">
        NYC Taxi Analytics Dashboard
      </h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Test Page</h2>
        <p className="text-gray-600 mb-4">
          This is a test page to verify that the Next.js application is working correctly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="metric-label">Test Metric 1</div>
            <div className="metric-value">1,234</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Test Metric 2</div>
            <div className="metric-value">$5,678</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Test Metric 3</div>
            <div className="metric-value">89%</div>
          </div>
        </div>
        <div className="mt-6">
          <a href="/" className="btn-primary">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
} 
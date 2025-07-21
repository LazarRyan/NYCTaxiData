'use client'

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="mt-4 text-center">
          <p className="text-gray-600 font-medium">Loading NYC Taxi Data...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the latest analytics</p>
        </div>
      </div>
    </div>
  )
} 
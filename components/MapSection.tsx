'use client'

import { useEffect, useState } from 'react'
import { getLocationCoordinates, getLocationName } from '@/lib/locationMapping'

interface MapSectionProps {
  data: any[]
}

export default function MapSection({ data }: MapSectionProps) {
  const [hovered, setHovered] = useState<null | {
    x: number;
    y: number;
    locationName: string;
    count: number;
    avgFare: number;
    totalFare: number;
  }>(null)

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Trip Locations Map</h3>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  // Sample a subset of data for better performance
  const sampleData = data.slice(0, 100)

  // Check if we have location ID data
  const hasLocationData = sampleData.some(trip => trip.pickup_location_id)

  if (!hasLocationData) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Trip Locations Map</h3>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Map data not available</p>
            <p className="text-sm text-gray-400">Location data is not included in the current dataset</p>
          </div>
        </div>
      </div>
    )
  }

  interface LocationGroup {
    lat: number
    lng: number
    count: number
    totalFare: number
    avgFare: number
    locationName: string
  }

  // Group trips by location ID for clustering effect
  const locationGroups = sampleData.reduce((acc, trip) => {
    if (!trip.pickup_location_id) return acc
    const locationId = trip.pickup_location_id
    const coords = getLocationCoordinates(locationId)
    if (!coords) return acc
    const key = locationId.toString()
    if (!acc[key]) {
      acc[key] = {
        lat: coords.lat,
        lng: coords.lng,
        count: 0,
        totalFare: 0,
        avgFare: 0,
        locationName: getLocationName(locationId)
      }
    }
    acc[key].count += 1
    acc[key].totalFare += trip.fare_amount || 0
    acc[key].avgFare = acc[key].totalFare / acc[key].count
    return acc
  }, {} as Record<string, LocationGroup>)

  const locations: LocationGroup[] = Object.values(locationGroups)

  // SVG map settings
  const width = 600
  const height = 600
  // NYC bounding box (approximate)
  const minLat = 40.4774
  const maxLat = 40.9176
  const minLng = -74.2591
  const maxLng = -73.7004

  // Project lat/lng to SVG coordinates
  function project(lat: number, lng: number) {
    const x = ((lng - minLng) / (maxLng - minLng)) * width
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height
    return [x, y]
  }

  const maxCount = Math.max(...locations.map(l => l.count), 1)

  return (
    <div className="chart-container relative">
      <h3 className="text-lg font-semibold mb-4">Trip Locations Map</h3>
      <div className="h-96 rounded-lg overflow-hidden flex justify-center items-center" style={{ position: 'relative' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: '#f0f0f0', borderRadius: 12 }}>
          {locations.map((location, i) => {
            const [x, y] = project(location.lat, location.lng)
            const radius = Math.max(4, Math.min(location.count / maxCount * 20, 20))
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={radius}
                fill="#3b82f6"
                stroke="#1d4ed8"
                strokeWidth={2}
                opacity={0.7}
                onMouseMove={e => {
                  setHovered({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                    locationName: location.locationName,
                    count: location.count,
                    avgFare: location.avgFare,
                    totalFare: location.totalFare
                  })
                }}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
        </svg>
        {hovered && (
          <div
            style={{
              position: 'absolute',
              left: hovered.x + 20,
              top: hovered.y + 20,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 8,
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: 120,
            }}
          >
            <div className="font-semibold">{hovered.locationName}</div>
            <div>Trips: {hovered.count}</div>
            <div>Avg Fare: ${hovered.avgFare.toFixed(2)}</div>
            <div>Total Revenue: ${hovered.totalFare.toFixed(2)}</div>
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>• Circle size represents number of trips from that location</p>
        <p>• Hover over circles to see detailed information</p>
        <p>• Showing {sampleData.length} sample trips from {locations.length} locations</p>
      </div>
    </div>
  )
} 
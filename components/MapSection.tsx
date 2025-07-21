'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { getLocationCoordinates, getLocationName } from '@/lib/locationMapping'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })

interface MapSectionProps {
  data: any[]
}

export default function MapSection({ data }: MapSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !data || data.length === 0) {
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
  
  // Calculate center point (NYC coordinates)
  const center = [40.7128, -74.0060]
  
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
  }

  // Group trips by location ID for clustering effect
  const locationGroups = sampleData.reduce((acc, trip) => {
    // Safety check for location ID
    if (!trip.pickup_location_id) {
      return acc
    }
    
    const locationId = trip.pickup_location_id
    const coords = getLocationCoordinates(locationId)
    
    if (!coords) {
      return acc
    }
    
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
  }, {} as Record<string, LocationGroup & { locationName: string }>)

  const locations: LocationGroup[] = Object.values(locationGroups)

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4">Trip Locations Map</h3>
      <div className="h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={center as [number, number]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {locations.map((location, index) => (
            <CircleMarker
              key={index}
              center={[location.lat, location.lng]}
              radius={Math.min(location.count * 2, 20)}
              fillColor="#3b82f6"
              color="#1d4ed8"
              weight={2}
              opacity={0.7}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold">{(location as any).locationName || 'Trip Location'}</h4>
                  <p>Trips: {location.count}</p>
                  <p>Avg Fare: ${location.avgFare.toFixed(2)}</p>
                  <p>Total Revenue: ${location.totalFare.toFixed(2)}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Circle size represents number of trips from that location</p>
        <p>• Click on circles to see detailed information</p>
        <p>• Showing {sampleData.length} sample trips from {locations.length} locations</p>
      </div>
    </div>
  )
} 
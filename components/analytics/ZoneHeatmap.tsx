'use client';

import { useEffect, useState } from 'react';

interface ZoneHeatmapDatum {
  pickup_location_id: number;
  trip_count: string;
  total_revenue: string;
}

interface Feature {
  type: 'Feature';
  properties: {
    locationid?: number;
    LocationID?: number;
    zone: string;
    borough: string;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

function getColor(count: number, max: number) {
  // Blue (low) to Red (high)
  const percent = max ? count / max : 0;
  const r = Math.round(255 * percent);
  const g = Math.round(100 * (1 - percent));
  const b = Math.round(255 * (1 - percent));
  return `rgb(${r},${g},${b})`;
}

// Simple mercator-like projection for NYC bounding box
function project([lng, lat]: [number, number], bbox: [number, number, number, number], width: number, height: number) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return [x, y];
}

export default function ZoneHeatmap({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<ZoneHeatmapDatum[]>([]);
  const [geojson, setGeojson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<{ x: number; y: number; name: string; borough: string; count: number; revenue: number } | null>(null);

  // SVG size
  const width = 600;
  const height = 600;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/zone-heatmap?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load heatmap data'));
    fetch('/nyu-2451-36743-geojson.json')
      .then(res => {
        if (!res.ok) {
          console.error('GeoJSON fetch failed with status:', res.status);
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(setGeojson)
      .catch((err) => {
        console.error('GeoJSON fetch error:', err);
        setError('Failed to load zone polygons');
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (error) {
    return <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-red-600">{error}</div>;
  }
  if (!geojson) {
    return <div className="bg-white rounded-lg shadow-md p-6 mb-8">Loading map...</div>;
  }

  // Find bounding box
  const allCoords = geojson.features.flatMap((f: Feature) => {
    if (f.geometry.type === 'Polygon') return f.geometry.coordinates.flat(1);
    if (f.geometry.type === 'MultiPolygon') return f.geometry.coordinates.flat(2);
    return [];
  });
  const lats = allCoords.map((c: [number, number]) => c[1]);
  const lngs = allCoords.map((c: [number, number]) => c[0]);
  const bbox: [number, number, number, number] = [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];

  // Map location_id to trip data
  const zoneStats = new Map<number, ZoneHeatmapDatum>();
  data.forEach(d => zoneStats.set(Number(d.pickup_location_id), d));
  const maxTrips = Math.max(...data.map(d => Number(d.trip_count) || 0), 1);

  function renderPolygon(coords: any, bbox: [number, number, number, number], width: number, height: number) {
    // coords: [ [lng, lat], ... ]
    return coords.map((ring: [number, number][]) =>
      ring.map(([lng, lat]) => project([lng, lat], bbox, width, height)).map(([x, y]) => `${x},${y}`).join(' ')
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Zone Heatmap</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: '#f0f0f0', borderRadius: 12 }}>
          {geojson.features.map((feature: Feature, i: number) => {
            const id = feature.properties.LocationID || feature.properties.locationid;
            const stat = zoneStats.get(Number(id));
            const count = stat ? Number(stat.trip_count) : 0;
            const revenue = stat ? Number(stat.total_revenue) : 0;
            let polygons: string[] = [];
            if (feature.geometry.type === 'Polygon') {
              polygons = renderPolygon(feature.geometry.coordinates, bbox, width, height);
            } else if (feature.geometry.type === 'MultiPolygon') {
              polygons = feature.geometry.coordinates.map((poly: any) => renderPolygon(poly, bbox, width, height)).flat();
            }
            return polygons.map((points, j) => (
              <polygon
                key={i + '-' + j}
                points={points}
                fill={getColor(count, maxTrips)}
                stroke="#333"
                strokeWidth={0.5}
                fillOpacity={0.7}
                onMouseMove={e => {
                  setHovered({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                    name: feature.properties.zone,
                    borough: feature.properties.borough,
                    count,
                    revenue,
                  });
                }}
                onMouseLeave={() => setHovered(null)}
              />
            ));
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
            <div className="font-semibold">{hovered.name}, {hovered.borough}</div>
            <div>Trips: {hovered.count.toLocaleString()}</div>
            <div>Revenue: {hovered.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">NYC zones colored by trip count. Hover for details.</div>
    </div>
  );
} 
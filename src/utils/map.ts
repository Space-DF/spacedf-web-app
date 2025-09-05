import { Device } from '@/stores/device-store'
import { DeviceSpace } from '@/types/device-space'
import { ConfigSpecification } from 'mapbox-gl'

type MapType = 'default' | '3D_map' | 'street'
const getMapStyle = (
  mapType: MapType,
  currentTheme: 'dark' | 'light'
): {
  style: string
  config: {
    [key: string]: ConfigSpecification
  }
} => {
  if (mapType === 'street') {
    return {
      style: `mapbox://styles/mapbox/${currentTheme}-v11`,
      config: {
        basemap: {},
      },
    }
  }

  if (mapType === '3D_map') {
    return {
      style: `mapbox://styles/mapbox/standard`,
      config: {
        basemap:
          currentTheme === 'dark'
            ? {
                lightPreset: 'dusk',
              }
            : {
                darkPreset: 'night',
              },
      },
    }
  }

  return {
    style: `mapbox://styles/mapbox/${currentTheme}-v11`,
    config: {
      basemap: {},
    },
  }
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180 // Convert degrees to radians
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers
  return distance
}

export function calculateTotalDistance(
  coordinates: {
    latitude: number
    longitude: number
  }[]
) {
  let totalDistance = 0

  for (let i = 0; i < coordinates.length - 1; i++) {
    const point1 = coordinates[i]
    const point2 = coordinates[i + 1]
    totalDistance += haversineDistance(
      point1.latitude,
      point1.longitude,
      point2.latitude,
      point2.longitude
    )
  }

  return totalDistance.toFixed(2) // km
}

export const transformDeviceData = (deviceSpace: DeviceSpace[]): Device[] => {
  return deviceSpace.map((device) => {
    return {
      name: device.device.lorawan_device.name,
      ...device.device,
      status: device.device.status as 'active' | 'inactive',
      id: device.id,
      layerProps: {
        sizeScale: 200,
        rotation: 'yaw',
        orientation: {
          pitch: 0,
          yaw: 90,
          roll: 90,
        },
      },
      type: device.device.type || 'rak',
      histories: {
        end: device.latest_checkpoint
          ? [
              device.latest_checkpoint?.longitude,
              device.latest_checkpoint?.latitude,
            ]
          : [108.22135225454248, 16.059130598128093],
      },
      latestLocation: device.latest_checkpoint
        ? [
            device.latest_checkpoint?.longitude,
            device.latest_checkpoint?.latitude,
          ]
        : [108.22135225454248, 16.059130598128093],
      realtimeTrip: [
        device.latest_checkpoint
          ? [
              device.latest_checkpoint?.longitude,
              device.latest_checkpoint?.latitude,
            ]
          : [108.22135225454248, 16.059130598128093],
      ],
      origin: 'Vietnam',
    }
  })
}

export { getMapStyle }
export type { MapType }

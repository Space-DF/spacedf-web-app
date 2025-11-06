import { DEVICE_LAYER_PROPERTIES } from '@/constants/device-property'
import { Device } from '@/stores/device-store'
import { DeviceSpace } from '@/types/device-space'
import { Checkpoint } from '@/types/trip'
import { ConfigSpecification } from 'mapbox-gl'
import { getClientOrganization } from './common'

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

const dummyTestingLocations = [
  [108.22135225454248, 16.059130598128093],
  [108.22135225454248, 16.059130598128093],
  [126.9970831, 37.550263],
  [108.6690844, 15.5036719],
]

const formatCheckpoint = (
  latestCheckpoint?: Checkpoint,
  dataIndex?: number
): [number, number] => {
  //#region: TODO: Handle data for testing. Remove this later.
  if (dataIndex !== undefined && !latestCheckpoint) {
    if (dummyTestingLocations[dataIndex])
      return dummyTestingLocations[dataIndex] as [number, number]
    return [108.22135225454248, 16.059130598128093]
  }
  //#endregion

  if (!latestCheckpoint) {
    return [108.22135225454248, 16.059130598128093]
  }

  return [latestCheckpoint.longitude, latestCheckpoint.latitude]
}

export const transformDeviceData = (deviceSpace: DeviceSpace[]): Device[] => {
  const currentOrg = getClientOrganization()

  const orgTestingEnv = process.env.NEXT_PUBLIC_ORG_TESTING_ENV

  const isDataTesting = currentOrg === orgTestingEnv

  return deviceSpace.map((device, index) => {
    return {
      ...device.device,
      name: device.name,
      status: device.device.status as 'active' | 'inactive',
      id: device.id,
      deviceId: device.device.id,
      layerProps: DEVICE_LAYER_PROPERTIES[device.device.type || 'rak'],
      type: device.device.type || 'rak',
      histories: {
        end: formatCheckpoint(
          device.latest_checkpoint,
          isDataTesting ? index : undefined
        ),
      },
      latestLocation: formatCheckpoint(
        device.latest_checkpoint,
        isDataTesting ? index : undefined
      ),
      realtimeTrip: [
        formatCheckpoint(
          device.latest_checkpoint,
          isDataTesting ? index : undefined
        ),
      ],
      origin: 'Vietnam',
      description: device.description,
    }
  })
}

export { getMapStyle }
export type { MapType }

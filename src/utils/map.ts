import {
  DEVICE_LAYER_PROPERTIES,
  LayerProperties,
  SupportedModels,
} from '@/constants/device-property'
import { Device } from '@/stores/device-store'
import { DeviceDataOriginal } from '@/types/device'
import { ConfigSpecification } from 'mapbox-gl'
import { getWaterDepthLevelName } from './water-depth'

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

const formatCheckpoint = (
  latestCheckpoint?: DeviceDataOriginal['latest_checkpoint']
): [number, number] => {
  if (!latestCheckpoint) {
    return [0, 0]
  }

  return [latestCheckpoint.longitude, latestCheckpoint.latitude]
}

const detectDeviceType = (deviceModelName: string): SupportedModels => {
  const lowerCaseDeviceModelName = deviceModelName?.toLowerCase() || ''
  if (lowerCaseDeviceModelName.startsWith('rak')) return 'rak'

  if (lowerCaseDeviceModelName.startsWith('tracki')) return 'tracki'

  if (lowerCaseDeviceModelName.startsWith('wlb')) return 'wlb'

  return 'rak'
}

export const transformDeviceData = (
  deviceSpace: DeviceDataOriginal[]
): Device[] => {
  return deviceSpace.map((device) => {
    const checkpoint = formatCheckpoint(
      device.device_properties?.latest_checkpoint || device.latest_checkpoint
    )
    const deviceType = detectDeviceType(
      device.device.device_profile?.device_type.toLowerCase() || ''
    )

    return {
      name: device.name,
      status: device.device.status as 'active' | 'inactive',
      id: device.device.id,
      deviceId: device.device.id,
      description: device.description || '',
      latestLocation: checkpoint,
      lorawan_device: device.device.lorawan_device,
      deviceInformation: device.device,
      type: deviceType,
      histories: {
        end: checkpoint,
        start: checkpoint,
      },
      deviceProperties: {
        latest_checkpoint_arr: checkpoint,
        water_level_name: getWaterDepthLevelName(
          device.device_properties?.water_depth || 0
        ),
        ...device.device_properties,
      },

      layerProps:
        (DEVICE_LAYER_PROPERTIES[deviceType] as LayerProperties) ||
        ({} as LayerProperties),
      origin: 'Vietnam',
    }
  })
}

const groupDeviceByFeature = (devices: Device[]): Record<string, Device[]> => {
  return devices.reduce(
    (acc, device) => {
      const feature = device.deviceInformation?.device_profile?.key_feature
      if (feature) {
        acc[feature] = acc[feature] || []
        acc[feature].push(device)
      }

      return acc
    },
    {} as Record<string, Device[]>
  )
}

export { getMapStyle, groupDeviceByFeature }
export type { MapType }

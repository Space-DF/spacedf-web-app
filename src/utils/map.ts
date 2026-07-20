import {
  DEVICE_LAYER_PROPERTIES,
  LayerProperties,
  SupportedModels,
} from '@/constants/device-property'
import { Device } from '@/stores/device-store'
import { DeviceDataOriginal } from '@/types/device'
import { getWaterDepthLevelName } from './water-depth'

type MapType = 'default' | '3D_map' | 'street'

const formatCheckpoint = (
  latestCheckpoint?: DeviceDataOriginal['latest_checkpoint']
): [number, number, number] => {
  if (!latestCheckpoint) {
    return [0, 0, 0]
  }

  return [
    latestCheckpoint.longitude,
    latestCheckpoint.latitude,
    latestCheckpoint.bearing ?? 0,
  ]
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

    const historyLngLat: [number, number] = [checkpoint[0], checkpoint[1]]

    return {
      name: device.name,
      status: device.device.status as 'active' | 'inactive',
      id: device.device.id,
      deviceId: device.device.id,
      deviceSpaceId: device.id,
      description: device.description || '',
      latestLocation: checkpoint,
      lorawan_device: device.device.lorawan_device,
      deviceInformation: device.device,
      entities: device.entities ?? [],
      isDeactivated: device.is_deactivated,
      type: deviceType,
      histories: {
        end: historyLngLat,
        start: historyLngLat,
      },
      deviceProperties: {
        latest_checkpoint_arr: checkpoint,
        water_level_name: getWaterDepthLevelName(
          device.device_properties?.water_depth || 0
        ),
        ...device.device_properties,
      },
      position: device.position,
      building: device.building,
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

export { groupDeviceByFeature }
export type { MapType }

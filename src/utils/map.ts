import {
  DEVICE_FEATURE_SUPPORTED,
  DeviceFeatureSupported,
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

export const transformDeviceData = (
  deviceSpace: DeviceDataOriginal[]
): Device[] => {
  return deviceSpace.map((device) => {
    const checkpoint = formatCheckpoint(
      device.device_properties?.latest_checkpoint ||
        device.latest_checkpoint ||
        device.device.location
    )

    const historyLngLat: [number, number] = [checkpoint[0], checkpoint[1]]

    return {
      status: device.device.status as 'active' | 'inactive',
      name: device.name,
      id: device.device.id,
      deviceId: device.device.id,
      deviceSpaceId: device.id,
      description: device.description || '',
      latestLocation: checkpoint,
      lorawan_device: device.device.lorawan_device,
      deviceInformation: device.device,
      entities: device.entities ?? [],
      isDeactivated: device.device.is_deactivated,
      type:
        device.device.device_profile?.key_feature ??
        DEVICE_FEATURE_SUPPORTED.LOCATION,
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
      origin: 'Vietnam',
    }
  })
}

const getDeviceLocation = (device: Device): [number, number] | null => {
  const { longitude = 0, latitude = 0 } =
    device.deviceInformation?.location ?? {}
  if (longitude || latitude) return [longitude, latitude]

  const [lng, lat] = device.deviceProperties?.latest_checkpoint_arr || [0, 0]

  return lng || lat ? [lng, lat] : null
}

const groupDeviceByFeature = (
  devices: Device[]
): Partial<Record<DeviceFeatureSupported, Device[]>> => {
  return devices.reduce(
    (acc, device) => {
      ;(acc[device.type] ??= []).push(device)
      return acc
    },
    {} as Partial<Record<DeviceFeatureSupported, Device[]>>
  )
}

export { getDeviceLocation, groupDeviceByFeature }
export type { MapType }

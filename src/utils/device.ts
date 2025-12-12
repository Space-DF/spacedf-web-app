import { DEVICE_MODEL } from '@/constants/device-property'
import { DeviceModel } from '@/types/device'

export const WATER_LEVEL_DEVICE_LAYERS: DeviceModel[] = [DEVICE_MODEL.WLB_V1]
export const NORMAL_DEVICE_LAYERS: DeviceModel[] = [
  DEVICE_MODEL.RAK,
  DEVICE_MODEL.TRACKI,
]

export const resolveLayerByDeviceType = (deviceType: DeviceModel) => {
  if (WATER_LEVEL_DEVICE_LAYERS.includes(deviceType)) return 'water_level'

  if (NORMAL_DEVICE_LAYERS.includes(deviceType)) return 'normal_device'

  return 'normal_device'
}

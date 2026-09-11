type SupportedModels = (typeof DEVICE_MODEL)[keyof typeof DEVICE_MODEL]
type DeviceFeatureSupported =
  (typeof DEVICE_FEATURE_SUPPORTED)[keyof typeof DEVICE_FEATURE_SUPPORTED]

const DEVICE_MODEL = {
  RAK: 'rak',
  TRACKI: 'tracki',
} as const

const DEVICE_FEATURE_SUPPORTED = {
  WATER_DEPTH: 'water_depth',
  LOCATION: 'location',
} as const

export { DEVICE_MODEL, DEVICE_FEATURE_SUPPORTED }
export type { SupportedModels, DeviceFeatureSupported }

type LayerProperties = {
  sizeScale: number
  rotation: 'yaw' | 'pitch' | 'roll'
  orientation: {
    pitch: number
    yaw: number
    roll: number
  }
}

type SupportedModels = (typeof DEVICE_MODEL)[keyof typeof DEVICE_MODEL]
type DeviceFeatureSupported =
  (typeof DEVICE_FEATURE_SUPPORTED)[keyof typeof DEVICE_FEATURE_SUPPORTED]

const DEVICE_MODEL = {
  RAK: 'rak',
  TRACKI: 'tracki',
  WLB: 'wlb',
} as const

const DEVICE_FEATURE_SUPPORTED = {
  WATER_DEPTH: 'water_depth',
  LOCATION: 'location',
} as const

const DEVICE_LAYER_PROPERTIES: Record<string, Record<string, any>> = {
  [DEVICE_MODEL.RAK]: {
    sizeScale: 200,
    rotation: 'yaw',
    orientation: {
      pitch: 0,
      yaw: 90,
      roll: 90,
    },
  },

  [DEVICE_MODEL.TRACKI]: {
    sizeScale: 700,
    rotation: 'yaw',
    orientation: {
      pitch: 0,
      yaw: 360,
      roll: 180,
    },
  },
}

export { DEVICE_LAYER_PROPERTIES, DEVICE_MODEL, DEVICE_FEATURE_SUPPORTED }
export type { LayerProperties, SupportedModels, DeviceFeatureSupported }

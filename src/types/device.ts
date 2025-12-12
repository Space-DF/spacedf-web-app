import {
  DEVICE_MODEL,
  DeviceFeatureSupported,
} from '@/constants/device-property'

type LorawanDevice = {
  join_eui?: string
  dev_eui?: string
  app_key?: string
  claim_code?: string
  tags?: string[]
  name?: string
  location?: string
}

type Checkpoint = {
  latitude: number
  longitude: number
}

type DeviceModelData = {
  id: string
  manufacture: string
  created_at: string
  updated_at: string
  name: string
  image_url: string
  device_type: string
  default_config: Record<string, any>
  key_feature: DeviceFeatureSupported
}

type DeviceData = {
  id: string
  network_server: string
  device_model: DeviceModelData
  status: string
  lorawan_device: LorawanDevice
  is_published: boolean
}

type DeviceProperties = {
  water_level?: number
  latest_checkpoint?: Checkpoint
}

type DeviceDataOriginal = {
  id: string
  name: string
  description: string | null
  device: DeviceData
  device_properties?: DeviceProperties

  //*TODO: Remove this after all devices have device_properties
  latest_checkpoint?: Checkpoint | null
}

type DeviceModel = (typeof DEVICE_MODEL)[keyof typeof DEVICE_MODEL]

export type {
  LorawanDevice,
  DeviceModelData,
  DeviceData,
  DeviceDataOriginal,
  DeviceModel,
}

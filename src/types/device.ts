import { SupportedModels } from '@/utils/model-objects/devices/gps-tracker/type'

export interface LorawanDevice {
  name: string
  dev_eui: string
  location: string
  tags: string[]
}

export interface Device {
  id: string
  device_id?: string
  device_name: string
  device_connector: string
  device_model: string
  status: string
  lorawan_device: LorawanDevice
  type?: SupportedModels
}

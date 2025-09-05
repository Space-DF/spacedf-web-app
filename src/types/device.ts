import { SupportedModels } from '@/utils/model-objects/devices/gps-tracker/type'

interface LorawanDevice {
  name: string
  dev_eui: string
  location: string
  tags: string[]
}

export interface Device {
  id: string
  device_connector: string
  device_model: string
  status: string
  lorawan_device: LorawanDevice
  type?: SupportedModels
}

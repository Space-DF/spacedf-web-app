import { Device } from './device'
import { Checkpoint } from './trip'

export interface DeviceSpace {
  id: string
  name: string
  description: string
  device: Device
  latest_checkpoint?: Checkpoint
  water_level?: number
}

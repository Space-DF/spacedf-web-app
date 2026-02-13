export interface Checkpoint {
  timestamp: string
  longitude: number
  latitude: number
  accuracy: number
}

export interface Trip {
  id: string
  space_device_id: string
  device_id: string
  device_name: string
  started_at: string
  is_finished: boolean
  last_latitude: number
  last_longitude: number
  last_report: string
  checkpoints: Checkpoint[]
}

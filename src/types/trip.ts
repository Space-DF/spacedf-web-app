export interface Checkpoint {
  latitude: number
  longitude: number
  timestamp: string
}
export interface Trip {
  id: string
  space_device: string
  started_at: string
  checkpoints: Checkpoint[]
}

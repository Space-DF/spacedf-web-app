import { WaterDepthLevelName } from '@/utils/water-depth'

export interface WaterLevelThreshold {
  warning: number
  critical: number
}

export interface Alert {
  id: string
  device_id: string
  entity_id: string
  entity_name: string
  level: WaterDepthLevelName
  message: string
  reported_at: string
  space_slug: string
  threshold: WaterLevelThreshold
  type: WaterDepthLevelName
  unit: string
  water_level: number
  water_depth: number
  location: {
    latitude: number
    longitude: number
  }
}

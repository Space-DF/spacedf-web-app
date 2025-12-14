export interface WaterLevelThreshold {
  warning: number
  critical: number
}

export type WaterLevelAlertLevel = 'warning' | 'critical'
export interface Alert {
  id: string
  device_id: string
  entity_id: string
  entity_name: string
  level: WaterLevelAlertLevel
  message: string
  reported_at: string
  space_slug: string
  threshold: WaterLevelThreshold
  type: WaterLevelAlertLevel
  unit: string
  water_level: number
  water_depth: number
  location: {
    latitude: number
    longitude: number
  }
}

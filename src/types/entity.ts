export interface EntityType {
  id: string
  name: string
  unique_key: string
  image_url: string
}

export interface Entity {
  id: string
  device_id: string
  device_name: string
  unique_key: string
  entity_type: EntityType
  name: string
  category: string
  unit_of_measurement: string
  display_type: string
  time_start: string
  time_end: string
  image_url: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

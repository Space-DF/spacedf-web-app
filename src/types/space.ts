export interface Space {
  id: string
  created_at: string
  updated_at: string
  name: string
  logo: string
  slug_name: string
  is_active: boolean
  total_devices: number
  created_by: string
}

export interface SpaceRole {
  id: string
  created_at: string
  updated_at: string
  name: string
  policies: string[]
  space: string
}

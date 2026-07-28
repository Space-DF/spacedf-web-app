export interface Space {
  id: string
  created_at: string
  updated_at: string
  name: string
  url_logo: string
  slug_name: string
  is_active: boolean
  is_deactivated: boolean
  total_devices: number
  created_by: string
  default_display: boolean
  description?: string
  build_artifact?: string
  url_build_artifact?: string
}

export interface CheckSpaceAccessResponse {
  is_locked: boolean
}

export interface SpaceRole {
  id: string
  created_at: string
  updated_at: string
  name: string
  policies: string[]
  space: string
}

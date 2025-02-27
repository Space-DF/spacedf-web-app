export interface Organization {
  id: string
  created_at: string
  updated_at: string
  name: string
  logo: string
  slug_name: string
  is_active: boolean
  oauth2_redirect_uris: string
  template: string
}

export interface ThemeColors {
  card: string
  text: string
  input: string
  accent: string
  border: string
  primary: string
  secondary: string
  background: string
  accent_text: string
  input_border: string
  primary_text: string
  support_text: string
  secondary_text: string
  switch_background: string
}

export interface OrganizationTheme {
  id: string
  theme_key: string
  theme_colors: ThemeColors
  url_logo: string
  url_favicon: string
}

export interface BorderRadiusSetting {
  card: number
  input: number
  button: number
}

export type CustomPageType =
  | 'sign_in'
  | 'sign_up'
  | 'forget_password'
  | 'change_password'

export interface CustomPage {
  id: string
  page_type: CustomPageType
  title: string
  subtitle: string
  metadata: Record<string, unknown>
  theme_colors: Partial<ThemeColors>
  show_logo: boolean
  url_background_image?: string
  created_at: string
  updated_at: string
}

export interface OrganizationSetting {
  id: string
  site_title: string
  site_description: string
  border_radius: BorderRadiusSetting
  themes: OrganizationTheme[]
  brand_name: string
  custom_pages?: CustomPage[]
}

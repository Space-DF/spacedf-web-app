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

export interface OrganizationSetting {
  id: string
  site_title: string
  site_description: string
  border_radius: BorderRadiusSetting
  themes: OrganizationTheme[]
  brand_name: string
}

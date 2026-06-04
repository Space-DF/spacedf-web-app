export interface ThemeColors {
  text: string
  input: string
  outline: string
  primary: string
  background: string
  device_card: string
  widget_card: string
  support_text: string
  widget_border: string
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

import { OrganizationSetting, OrganizationTheme } from '@/types/organization'

/**
 * Converts a hex color string to space-separated HSL components
 * (e.g. "#ffffff" -> "0 0% 100%").
 */
export function hexToHslComponents(hex: string): string {
  if (!hex) return ''

  let cleanHex = hex.trim().replace('#', '')

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  if (cleanHex.length !== 6) {
    if (/^\d+(\.\d+)?\s+\d+%\s+\d+%$/.test(cleanHex)) {
      return cleanHex
    }
    return ''
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  const hDeg = Math.round(h * 360)
  const sPct = Math.round(s * 100)
  const lPct = Math.round(l * 100)

  return `${hDeg} ${sPct}% ${lPct}%`
}

/**
 * Returns either '#ffffff' (white) or '#000000' (black) based on the relative luminance of the input hex color.
 */
export function getContrastColor(hexColor: string): string {
  if (!hexColor || typeof hexColor !== 'string') return '#000000'

  const cleanHex = hexColor.replace('#', '')
  let r = 0,
    g = 0,
    b = 0

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  } else {
    return '#000000'
  }

  // Calculate relative luminance or YIQ contrast
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? '#000000' : '#ffffff'
}

/**
 * Compiles a dynamic CSS string containing CSS custom property overrides
 * for light (:root) and dark (.dark) themes from OrganizationSetting.
 */
export function generateThemeStyles(setting: OrganizationSetting): string {
  const themes = setting.themes || []

  // First theme is light, second theme is dark
  const lightTheme = themes.find((t) => t.theme_key === 'light') || themes[0]
  const darkTheme = themes.find((t) => t.theme_key === 'dark') || themes[1]
  const radiusSetting = setting.border_radius

  let styles = ''

  const getThemeCss = (theme: OrganizationTheme, selector: string) => {
    if (!theme || !theme.theme_colors) return ''
    const c = theme.theme_colors

    const backgroundHsl = hexToHslComponents(c.background)
    const textHsl = hexToHslComponents(c.text)
    const primaryHsl = hexToHslComponents(c.primary)
    const primaryContrastHsl = c.primary
      ? hexToHslComponents(getContrastColor(c.primary))
      : ''
    const supportTextHsl = hexToHslComponents(c.support_text)
    const inputHsl = hexToHslComponents(c.input)
    const inputContrastHsl = c.input
      ? hexToHslComponents(getContrastColor(c.input))
      : ''
    const outlineHsl = hexToHslComponents(c.outline)
    const widgetBorderHsl = hexToHslComponents(c.widget_border)
    const widgetCardHsl = hexToHslComponents(c.widget_card)
    const deviceCardHsl = hexToHslComponents(c.device_card)

    return `
${selector} {
  ${backgroundHsl ? `--background: ${backgroundHsl}; --background-fill-outermost: ${backgroundHsl};` : ''}
  ${textHsl ? `--foreground: ${textHsl}; --typo-body: ${textHsl}; --typo-display: ${textHsl}; --typo-heading: ${textHsl}; --typo-caption: ${textHsl};` : ''}
  ${primaryHsl ? `--primary: ${primaryHsl};` : ''}
  ${primaryContrastHsl ? `--primary-foreground: ${primaryContrastHsl};` : ''}
  ${supportTextHsl ? `--muted-foreground: ${supportTextHsl}; --typo-caption-soft: ${supportTextHsl}; --typo-body-soft: ${supportTextHsl};` : ''}
  ${inputHsl ? `--input: ${inputHsl};` : ''}
  ${inputContrastHsl ? `--input-foreground: ${inputContrastHsl};` : ''}
  ${outlineHsl ? `--ring: ${outlineHsl};` : ''}
  ${widgetBorderHsl ? `--border: ${widgetBorderHsl}; --background-stroke-surface: ${widgetBorderHsl}; --background-stroke-outermost: ${widgetBorderHsl}; --background-stroke-middle: ${widgetBorderHsl}; --background-stroke-inner: ${widgetBorderHsl};` : ''}
  ${widgetCardHsl ? `--card: ${widgetCardHsl}; --background-fill-middle: ${widgetCardHsl}; --background-fill-inner: ${widgetCardHsl}; --background-fill-central: ${widgetCardHsl};` : ''}
  ${deviceCardHsl ? `--background-fill-surface: ${deviceCardHsl};` : ''}
}
`
  }

  if (lightTheme) {
    styles += getThemeCss(lightTheme, ':root')
  }
  if (darkTheme) {
    styles += getThemeCss(darkTheme, '.dark')
  }

  if (radiusSetting) {
    const cardRadius = radiusSetting.card !== undefined ? radiusSetting.card : 8
    const inputRadius =
      radiusSetting.input !== undefined ? radiusSetting.input : 6
    const buttonRadius =
      radiusSetting.button !== undefined ? radiusSetting.button : 8

    styles += `
:root, .dark {
  --radius: ${cardRadius}px;
  --button-radius: ${buttonRadius}px;
  --input-radius: ${inputRadius}px;
}
`
  }

  return styles
}

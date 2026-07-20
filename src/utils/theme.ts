import { OrganizationSetting, ThemeColors } from '@/types/organization'

/**
 * Fallback palettes used when the backend does not provide a value for a given
 * color key (or provides no theme at all). Per-key: a non-empty backend value
 * always wins; otherwise the matching default below is used.
 */
export const defaultLightColors: ThemeColors = {
  primary: '#282828',
  primary_text: '#FCFCFC',
  secondary: '#FFFFFF',
  secondary_text: '#282828',
  accent: '#F0F1F3',
  accent_text: '#282828',
  background: '#FFFFFF',
  border: '#E0E2E7',
  text: '#282828',
  support_text: '#808080',
  card: '#FFFFFF',
  switch_background: '#EDEDED',
  input: '#FFFFFF',
  input_border: '#E0E2E7',
}

export const defaultDarkColors: ThemeColors = {
  primary: '#6009FF',
  primary_text: '#FCFCFC',
  secondary: '#1B1B1B',
  secondary_text: '#FCFCFC',
  accent: '#160733',
  accent_text: '#FCFCFC',
  background: '#1B1B1B',
  border: '#4D4D4D',
  text: '#FCFCFC',
  support_text: '#A8A8A8',
  card: '#282828',
  switch_background: '#282828',
  input: '#1B1B1B',
  input_border: '#4D4D4D',
}

/**
 * Merges backend-provided colors over a default palette, ignoring empty values
 * so a single missing key still falls back to its default.
 */
function resolveColors(
  colors: Partial<ThemeColors> | undefined,
  defaults: ThemeColors
): ThemeColors {
  const resolved = { ...defaults }
  if (colors) {
    ;(Object.keys(defaults) as (keyof ThemeColors)[]).forEach((key) => {
      const value = colors[key]
      if (value) resolved[key] = value
    })
  }
  return resolved
}

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

  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    if (/^\\d+(\\.\\d+)?\\s+\\d+%\\s+\\d+%$/.test(cleanHex)) {
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

  // Keep two decimals instead of rounding to integers so the hex -> HSL -> RGB
  // round-trip stays color-exact (integer HSL drifts ~1-2 per channel).
  const round = (n: number) => Math.round(n * 100) / 100
  const hDeg = round(h * 360)
  const sPct = round(s * 100)
  const lPct = round(l * 100)

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
 * The org palette is injected as a self-contained set of `--org-*` custom
 * properties (one per API color key). Only a short, explicit list of shadcn
 * core tokens is then *aliased* to those `--org-*` vars, so branding stays
 * scoped to known surfaces instead of leaking into every derived token chain.
 */
const ORG_VAR_KEYS: { var: string; key: keyof ThemeColors }[] = [
  { var: '--org-card', key: 'card' },
  { var: '--org-text', key: 'text' },
  { var: '--org-input', key: 'input' },
  { var: '--org-accent', key: 'accent' },
  { var: '--org-border', key: 'border' },
  { var: '--org-primary', key: 'primary' },
  { var: '--org-secondary', key: 'secondary' },
  { var: '--org-background', key: 'background' },
  { var: '--org-accent-text', key: 'accent_text' },
  { var: '--org-input-border', key: 'input_border' },
  { var: '--org-primary-text', key: 'primary_text' },
  { var: '--org-support-text', key: 'support_text' },
  { var: '--org-secondary-text', key: 'secondary_text' },
  { var: '--org-switch-background', key: 'switch_background' },
]

/**
 * Maps a shadcn core token to the `--org-*` var that should drive it.
 * `key` gates the alias on the source color actually being present.
 */
const CORE_TOKEN_ALIASES: {
  token: string
  var: string
  key: keyof ThemeColors
}[] = [
  { token: '--background', var: '--org-background', key: 'background' },
  { token: '--foreground', var: '--org-text', key: 'text' },
  { token: '--card', var: '--org-card', key: 'card' },
  { token: '--card-foreground', var: '--org-text', key: 'text' },
  { token: '--primary', var: '--org-primary', key: 'primary' },
  {
    token: '--primary-foreground',
    var: '--org-primary-text',
    key: 'primary_text',
  },
  { token: '--secondary', var: '--org-secondary', key: 'secondary' },
  {
    token: '--secondary-foreground',
    var: '--org-secondary-text',
    key: 'secondary_text',
  },
  { token: '--accent', var: '--org-accent', key: 'accent' },
  {
    token: '--accent-foreground',
    var: '--org-accent-text',
    key: 'accent_text',
  },
  {
    token: '--muted-foreground',
    var: '--org-support-text',
    key: 'support_text',
  },
  { token: '--border', var: '--org-border', key: 'border' },
  { token: '--input', var: '--org-input', key: 'input' },
  { token: '--ring', var: '--org-primary', key: 'primary' },
]

/**
 * Compiles a dynamic CSS string for the light (:root) and dark (.dark) themes
 * from OrganizationSetting. Emits the `--org-*` palette plus a controlled set
 * of core-token aliases.
 */
export function generateThemeStyles(setting?: OrganizationSetting): string {
  const themes = setting?.themes || []

  // First theme is light, second theme is dark
  const lightTheme = themes.find((t) => t.theme_key === 'light') || themes[0]
  const darkTheme = themes.find((t) => t.theme_key === 'dark') || themes[1]
  const radiusSetting = setting?.border_radius

  // Backend values win per-key, missing keys fall back to the defaults.
  const lightColors = resolveColors(
    lightTheme?.theme_colors,
    defaultLightColors
  )
  const darkColors = resolveColors(darkTheme?.theme_colors, defaultDarkColors)

  let styles = ''

  const getThemeCss = (c: ThemeColors, selector: string) => {
    // Pre-compute HSL components once per color key.
    const hsl = new Map<keyof ThemeColors, string>()
    ORG_VAR_KEYS.forEach(({ key }) => {
      const value = hexToHslComponents(c[key])
      if (value) hsl.set(key, value)
    })

    const orgVarLines = ORG_VAR_KEYS.filter(({ key }) => hsl.has(key)).map(
      ({ var: name, key }) => `  ${name}: ${hsl.get(key)};`
    )

    const aliasLines = CORE_TOKEN_ALIASES.filter(({ key }) => hsl.has(key)).map(
      ({ token, var: name }) => `  ${token}: var(${name});`
    )

    const lines = [...orgVarLines, ...aliasLines]
    if (!lines.length) return ''

    return `${selector} {\n${lines.join('\n')}\n}\n`
  }

  styles += getThemeCss(lightColors, ':root')
  styles += getThemeCss(darkColors, '.dark')

  if (radiusSetting) {
    const cardRadius =
      radiusSetting.card !== undefined ? radiusSetting.card : 12
    const inputRadius =
      radiusSetting.input !== undefined ? radiusSetting.input : 12
    const buttonRadius =
      radiusSetting.button !== undefined ? radiusSetting.button : 12

    styles += `
:root, .dark {
  --button-radius: ${buttonRadius}px;
  --input-radius: ${inputRadius}px;
  --radius-card: ${cardRadius}px;
}
`
  }

  return styles
}

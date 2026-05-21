import { useEffect, useMemo, useState } from 'react'

function parseHexColor(
  input: string | undefined
): { r: number; g: number; b: number } | null {
  if (!input?.trim()) return null
  const hex = input.trim().replace(/^#/, '')
  if (hex.length === 3) {
    const r = parseInt(hex[0]! + hex[0]!, 16)
    const g = parseInt(hex[1]! + hex[1]!, 16)
    const b = parseInt(hex[2]! + hex[2]!, 16)
    if ([r, g, b].some((n) => Number.isNaN(n))) return null
    return { r, g, b }
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    if ([r, g, b].some((n) => Number.isNaN(n))) return null
    return { r, g, b }
  }
  return null
}

function rgbToHue(r: number, g: number, b: number): number {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  if (d === 0) return 0
  let h = 0
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
      break
    case gn:
      h = ((bn - rn) / d + 2) / 6
      break
    default:
      h = ((rn - gn) / d + 4) / 6
      break
  }
  return Math.round(h * 360)
}

function hueFromString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h % 360
}

function isAchromatic(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max - min < 14
}

function parseCssColor(
  value: string
): { r: number; g: number; b: number } | null {
  const t = value.trim()
  const hex = parseHexColor(t)
  if (hex) return hex
  const m = t.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
  if (m) {
    const r = Math.round(Number(m[1]))
    const g = Math.round(Number(m[2]))
    const b = Math.round(Number(m[3]))
    if ([r, g, b].every((n) => !Number.isNaN(n) && n >= 0 && n <= 255))
      return { r, g, b }
  }
  return null
}

function isIgnorableSvgPaint(value: string): boolean {
  const v = value.trim().toLowerCase()
  return (
    v === '' ||
    v === 'none' ||
    v === 'transparent' ||
    v === 'currentcolor' ||
    v.startsWith('url(')
  )
}

function isVeryLightRgb({
  r,
  g,
  b,
}: {
  r: number
  g: number
  b: number
}): boolean {
  return r > 248 && g > 248 && b > 248
}

function initialHueFromProps(icon?: string, icon_color?: string): number {
  const parsed = parseHexColor(icon_color)
  if (parsed) {
    if (isAchromatic(parsed.r, parsed.g, parsed.b))
      return icon ? hueFromString(icon) : 210
    return rgbToHue(parsed.r, parsed.g, parsed.b)
  }
  return icon ? hueFromString(icon) : 210
}

function paletteFromHue(h: number): { backgroundColor: string; color: string } {
  return {
    backgroundColor: `hsl(${h} 52% 92%)`,
    color: `hsl(${h} 38% 20%)`,
  }
}

function isLikelySvgUrl(url: string): boolean {
  return /\.svg(\?|#|$)/i.test(url) || url.toLowerCase().includes('.svg')
}

function extractAccentRgbFromSvgMarkup(
  svgText: string
): { r: number; g: number; b: number } | null {
  if (!/<\s*svg[\s>]/i.test(svgText)) return null
  try {
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
    const nodes = doc.querySelectorAll('[fill],[stroke]')
    for (const el of Array.from(nodes)) {
      for (const attr of ['fill', 'stroke'] as const) {
        const raw = el.getAttribute(attr)
        if (!raw) continue
        const v = raw.trim()
        if (isIgnorableSvgPaint(v)) continue
        const rgb = parseCssColor(v)
        if (!rgb || isVeryLightRgb(rgb)) continue
        return rgb
      }
    }
  } catch {
    return null
  }
  return null
}

export function useMetricBadgePalette(icon?: string) {
  const baseHue = useMemo(() => initialHueFromProps(icon), [icon])
  const [svgHue, setSvgHue] = useState<number | null>(null)

  useEffect(() => {
    setSvgHue(null)
  }, [icon])

  useEffect(() => {
    if (!icon || !isLikelySvgUrl(icon)) return

    const ctrl = new AbortController()
    const run = async () => {
      try {
        const res = await fetch(icon, {
          signal: ctrl.signal,
          mode: 'cors',
          credentials: 'omit',
          cache: 'force-cache',
        })
        if (!res.ok || ctrl.signal.aborted) return
        const text = await res.text()
        if (ctrl.signal.aborted) return
        const rgb = extractAccentRgbFromSvgMarkup(text)
        if (!rgb) return
        const h = isAchromatic(rgb.r, rgb.g, rgb.b)
          ? hueFromString(icon)
          : rgbToHue(rgb.r, rgb.g, rgb.b)
        if (!ctrl.signal.aborted) setSvgHue(h)
      } catch {
        /* CORS, offline, or non-SVG body */
      }
    }
    void run()
    return () => ctrl.abort()
  }, [icon])

  return useMemo(() => paletteFromHue(svgHue ?? baseHue), [svgHue, baseHue])
}

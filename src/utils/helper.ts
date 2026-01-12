export function stripHTML(str: string): string {
  return str.replace(/<[^>]+>/g, ' ').replace(/ +/g, ' ')
}

export function removeUnicode(str: string): string {
  return stripHTML(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
}

export function toSlug(str: string): string {
  return removeUnicode(str)
    .toLowerCase()
    .replace(/([^0-9a-z-\s])/g, '-')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
}

export function getShortName(str: string): string {
  if (!str) return ''
  const words = str.trim().split(' ')

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return (
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1].charAt(0).toUpperCase()
  )
}

export function textToHexColor(text: string): string {
  if (!text) return '#E7DAFE'

  let hash = 0

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).slice(-2)
  }

  return color
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
  }

  throw new Error('Invalid hex color format')
}

export function getColorText(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000
  return luminance > 125 ? '#4006AA' : '#fff'
}

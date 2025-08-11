export * from './navigation'
export * from './local-storage'
export * from './cookie'
export * from './enum'
export * from './color'
export * from './date-format'
export * from './time-zone'
export * from './demo'

// Responsive breakpoints and sidebar collapse thresholds
export const RESPONSIVE_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1480,
  LARGE_DESKTOP: 1920,
} as const

// Sidebar collapse thresholds based on screen size
export const SIDEBAR_COLLAPSE_THRESHOLDS = {
  MOBILE: 25, // 25% on mobile screens
  TABLET: 18, // 18% on tablet screens
  DESKTOP: 16, // 12% on desktop screens
  LARGE_DESKTOP: 11, // 8% on large desktop screens
} as const

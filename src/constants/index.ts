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
  FULL_HD: 2560,
  QUAD_HD: 3840,
  OCTA_HD: 7680,
} as const

// Sidebar collapse thresholds based on screen size
export const SIDEBAR_COLLAPSE_THRESHOLDS = {
  MOBILE: 25, // 25% on mobile screens
  TABLET: 18, // 18% on tablet screens
  DESKTOP: 12, // 12% on desktop screens
  LARGE_DESKTOP: 8, // 8% on large desktop screens
  FULL_HD: 6, // 6% on full HD screens
  QUAD_HD: 4, // 4% on quad HD screens
  OCTA_HD: 2, // 2% on octa HD screens
} as const

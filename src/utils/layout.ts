import {
  RESPONSIVE_BREAKPOINTS,
  SIDEBAR_COLLAPSE_THRESHOLDS,
} from '@/constants'

export const getResponsiveLayout = (
  defaultLayout: number[] = [15, 85]
): number[] => {
  if (typeof window === 'undefined') return defaultLayout

  const screenWidth = window.innerWidth
  let sidebarWidth = defaultLayout[0]

  if (screenWidth < 1024) {
    sidebarWidth = 30
  } else if (screenWidth < 1480) {
    sidebarWidth = 20
  } else {
    sidebarWidth = 15
  }
  return [sidebarWidth, 100 - sidebarWidth]
}

/**
 * Get responsive collapse threshold based on screen width
 * Different screen sizes have different threshold values to ensure sidebar doesn't break
 */
export const getResponsiveCollapseThreshold = (): number => {
  if (typeof window === 'undefined') return SIDEBAR_COLLAPSE_THRESHOLDS.DESKTOP

  const screenWidth = window.innerWidth
  if (screenWidth < RESPONSIVE_BREAKPOINTS.TABLET) {
    return SIDEBAR_COLLAPSE_THRESHOLDS.TABLET
  } else if (screenWidth < RESPONSIVE_BREAKPOINTS.DESKTOP) {
    return SIDEBAR_COLLAPSE_THRESHOLDS.DESKTOP
  } else if (screenWidth < RESPONSIVE_BREAKPOINTS.LARGE_DESKTOP) {
    return SIDEBAR_COLLAPSE_THRESHOLDS.LARGE_DESKTOP
  } else if (screenWidth < RESPONSIVE_BREAKPOINTS.FULL_HD) {
    return SIDEBAR_COLLAPSE_THRESHOLDS.DESKTOP
  } else if (screenWidth < RESPONSIVE_BREAKPOINTS.QUAD_HD) {
    return SIDEBAR_COLLAPSE_THRESHOLDS.QUAD_HD
  } else if (screenWidth < RESPONSIVE_BREAKPOINTS.OCTA_HD) {
    return SIDEBAR_COLLAPSE_THRESHOLDS.OCTA_HD
  } else {
    return SIDEBAR_COLLAPSE_THRESHOLDS.DESKTOP
  }
}

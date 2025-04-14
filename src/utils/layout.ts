export const getResponsiveLayout = (
  defaultLayout: number[] = [15, 85]
): number[] => {
  if (typeof window === 'undefined') return defaultLayout

  const screenWidth = window.innerWidth
  let sidebarWidth = defaultLayout[0]
  if (screenWidth < 1480) {
    sidebarWidth = 20
  } else {
    sidebarWidth = 15
  }

  return [sidebarWidth, 100 - sidebarWidth]
}

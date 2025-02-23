export const checkMapRendered = () => {
  if (typeof window === 'undefined') return false

  const map = window?.mapInstance?.getMapInstance()
  if (!map) return false

  return map.isStyleLoaded()
}

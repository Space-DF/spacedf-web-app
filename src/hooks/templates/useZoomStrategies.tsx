import { Device } from '@/stores/device-store'
import { useCallback, useMemo } from 'react'

const getBoundsFromCoordinates = (coordinates: number[][]) => {
  if (!coordinates.length)
    return [
      [0, 0],
      [0, 0],
    ] as number[][]

  let minLng = coordinates[0][0]
  let minLat = coordinates[0][1]
  let maxLng = coordinates[0][0]
  let maxLat = coordinates[0][1]

  coordinates.forEach(([lng, lat]) => {
    if (lng < minLng) minLng = lng
    if (lat < minLat) minLat = lat
    if (lng > maxLng) maxLng = lng
    if (lat > maxLat) maxLat = lat
  })

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

export const useZoomStrategies = () => {
  const resolvedPitch = useMemo(() => {
    const modelType =
      (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') || '2d'

    return modelType === '3d' ? 90 : 0
  }, [])

  const zoomToSingleDevice = useCallback(
    (device: Device, map: mapboxgl.Map) => {
      const [lng, lat] = device.latestLocation || [0, 0]

      if (!lng || !lat) return

      map.flyTo({
        center: [lng, lat],
        zoom: 17,
        duration: 6000,
        pitch: resolvedPitch,
      })
    },
    []
  )

  const zoomToFitDevices = useCallback(
    (devices: Record<string, Device>, map: mapboxgl.Map) => {
      const listDevice = Object.values(devices)

      const coordinates = listDevice
        .map((d) => d?.latestLocation)
        .filter(
          (loc): loc is [number, number] =>
            Array.isArray(loc) && loc.length === 2
        )

      if (!coordinates.length) return

      const bounds = getBoundsFromCoordinates(coordinates)

      const [firstLng, firstLat] = coordinates[0]
      const allSameLocation = coordinates.every(
        ([lng, lat]) => lng === firstLng && lat === firstLat
      )

      if (allSameLocation) {
        map.flyTo({
          center: [firstLng, firstLat],
          zoom: 15,
          duration: 5000,
          pitch: resolvedPitch,
        })
      } else {
        map.fitBounds(
          [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
          {
            padding: 100,
            duration: 5000,
            pitch: resolvedPitch,
            maxZoom: 18,
          }
        )
      }
    },
    []
  )
  return {
    zoomToSingleDevice,
    zoomToFitDevices,
  }
}

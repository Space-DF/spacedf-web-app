import { getLocationName } from '@/utils/mapbox-geocoding'
import useSWR from 'swr'

export const useTripAddress = (
  locations: { longitude?: number; latitude?: number }[]
) => {
  return useSWR(
    locations.length > 0
      ? `mapbox-geocoding-${locations.map((location) => `${location.longitude},${location.latitude}`).join(';')}`
      : null,
    () => getLocationName({ locations })
  )
}

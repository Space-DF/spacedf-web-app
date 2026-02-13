import { geocodingService } from '@/utils/map-geocoding'
import useSWR from 'swr'

export const useTripAddress = (locations: [number, number][]) => {
  return useSWR(
    locations.length > 0
      ? `geocoding-${locations.map((location) => `${location[0]},${location[1]}`).join(';')}`
      : null,
    () => geocodingService.batchReverse(locations, { returnType: 'array' })
  )
}

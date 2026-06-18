import { geocodingService } from '@/utils/map-geocoding'
import { useQuery } from '@tanstack/react-query'

export const useTripAddress = (locations: [number, number][]) => {
  const serializedLocations = locations
    .map((location) => `${location[0]},${location[1]}`)
    .join(';')

  return useQuery({
    queryKey: ['geocoding', serializedLocations],
    queryFn: () =>
      geocodingService.batchReverse(locations, { returnType: 'array' }),
    enabled: locations.length > 0,
  })
}

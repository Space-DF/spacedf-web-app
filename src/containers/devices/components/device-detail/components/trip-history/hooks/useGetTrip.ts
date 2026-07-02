import { Trip } from '@/types/trip'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

export const useGetTrip = (tripId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  return useQuery<Trip>({
    queryKey: ['trip', spaceSlug, tripId],
    queryFn: () =>
      fetcher<Trip>(`/api/trip/${spaceSlug}/trip-detail/${tripId}`),
    enabled: !!tripId && !!spaceSlug,
  })
}

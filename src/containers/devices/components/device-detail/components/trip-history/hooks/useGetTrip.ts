import { Trip } from '@/types/trip'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useGetTrip = (tripId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    tripId && spaceSlug ? `/api/trip/${spaceSlug}/trip-detail/${tripId}` : null,
    fetcher<Trip>
  )
}

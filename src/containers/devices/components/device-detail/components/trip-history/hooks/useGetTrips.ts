import { Trip } from '@/types/trip'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

export const useGetTrips = (deviceId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const query = useQuery<Trip[]>({
    queryKey: ['trips', spaceSlug, deviceId],
    queryFn: () => fetcher<Trip[]>(`/api/trip/${spaceSlug}/${deviceId}`),
    enabled: !!deviceId && !!spaceSlug,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    mutate: query.refetch,
  }
}

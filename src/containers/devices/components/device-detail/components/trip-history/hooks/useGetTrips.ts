import { Trip } from '@/types/trip'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useGetTrips = (deviceId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    deviceId ? `/api/trip/${spaceSlug}/${deviceId}` : null,
    fetcher<Trip[]>
  )
}

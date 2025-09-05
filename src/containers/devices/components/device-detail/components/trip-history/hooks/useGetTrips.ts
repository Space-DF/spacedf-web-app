import api from '@/lib/api'
import { Trip } from '@/types/trip'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const fetcher = async (url: string) => api.get<Promise<Trip[]>>(url)

export const useGetTrips = (deviceId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(deviceId ? `/api/trip/${spaceSlug}/${deviceId}` : null, fetcher)
}

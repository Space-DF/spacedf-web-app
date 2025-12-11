import { api } from '@/lib/api'
import { Trip } from '@/types/trip'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const getTripDetails = async (url: string) => {
  return api.get<Trip>(url)
}

export const useGetTrip = (tripId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    tripId && spaceSlug ? `/api/trip/${spaceSlug}/trip-detail/${tripId}` : null,
    getTripDetails
  )
}

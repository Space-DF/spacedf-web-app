import { Checkpoint } from '@/types/trip'
import { fetcher } from '@/utils/common'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useEvents = (deviceId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    spaceSlug && deviceId
      ? `/api/events/${deviceId}?spaceSlug=${spaceSlug}`
      : null,
    fetcher<Checkpoint[]>,
    {
      fallbackData: [],
    }
  )
}

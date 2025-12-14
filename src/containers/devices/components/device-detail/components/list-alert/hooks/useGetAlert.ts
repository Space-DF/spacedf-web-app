import { Alert } from '@/types/alert'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useGetAlert = (deviceId?: string, date?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    spaceSlug && deviceId
      ? `/api/alert/${spaceSlug}/${deviceId}?date=${date}`
      : null,
    fetcher<PaginationResponse<Alert>>
  )
}

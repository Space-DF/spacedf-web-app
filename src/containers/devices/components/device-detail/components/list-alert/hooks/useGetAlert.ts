import { Alert } from '@/types/alert'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useGetAlert = (
  deviceId?: string,
  startDate?: string,
  endDate?: string
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    spaceSlug && deviceId
      ? `/api/alert/${spaceSlug}/${deviceId}?start_date=${startDate}&end_date=${endDate}`
      : null,
    fetcher<PaginationResponse<Alert>>
  )
}

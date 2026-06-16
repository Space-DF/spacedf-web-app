import { Alert } from '@/types/alert'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

export const useGetAlert = (
  deviceId?: string,
  startDate?: string,
  endDate?: string
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const query = useQuery<PaginationResponse<Alert>>({
    queryKey: ['alerts', spaceSlug, deviceId, startDate, endDate],
    queryFn: () =>
      fetcher<PaginationResponse<Alert>>(
        `/api/alert/${spaceSlug}/${deviceId}?start_date=${startDate}&end_date=${endDate}`
      ),
    enabled: !!spaceSlug && !!deviceId,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isValidating: query.isFetching,
  }
}

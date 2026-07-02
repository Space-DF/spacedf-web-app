import { Action } from '@/types/action'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useQuery } from '@tanstack/react-query'

export const useActions = () => {
  const query = useQuery<PaginationResponse<Action>>({
    queryKey: ['actions'],
    queryFn: () => fetcher<PaginationResponse<Action>>('/api/action'),
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    mutate: query.refetch,
    error: query.error,
  }
}

import { DEFAULT_PAGE_SIZE } from '@/constants'
import {
  Automation,
  AutomationParams,
  AutomationStatus,
} from '@/types/automation'
import { fetcher } from '@/utils'
import api from '@/lib/api'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { PaginationResponse } from '@/types/global'

const AUTOMATIONS_ENDPOINT = '/api/automations'

type UseAutomationsParams = {
  search?: string
  spaceSlug?: string
  limit?: number
  status?: AutomationStatus
}

export const useAutomations = (params: UseAutomationsParams = {}) => {
  const { data, isLoading, refetch, hasNextPage, fetchNextPage, ...rest } =
    useInfiniteQuery<PaginationResponse<Automation>>({
      queryKey: ['automations', 'list', params],
      queryFn: ({ pageParam = 0 }) => {
        const offset =
          (pageParam as number) * (params.limit ?? DEFAULT_PAGE_SIZE)
        const searchParams = new URLSearchParams({
          offset: String(offset),
          limit: String(params.limit ?? DEFAULT_PAGE_SIZE),
          search: params.search ?? '',
          spaceSlug: params.spaceSlug ?? '',
          status: params.status ?? '',
        })
        return fetcher<PaginationResponse<Automation>>(
          `${AUTOMATIONS_ENDPOINT}?${searchParams.toString()}`
        )
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.next ? allPages.length : undefined
      },
    })

  const automations: Automation[] = data
    ? data.pages.flatMap((page) => page.results ?? [])
    : []
  const totalCount = data?.pages[0]?.count ?? 0
  const isReachingEnd = !hasNextPage

  return {
    automations,
    totalCount,
    isLoading,
    isReachingEnd,
    mutate: refetch,
    loadMore: () => (hasNextPage ? fetchNextPage() : Promise.resolve()),
    ...rest,
  }
}

export const useAutomation = (id: string, spaceSlug?: string) => {
  return useQuery<Automation>({
    queryKey: ['automations', 'detail', id, spaceSlug],
    queryFn: () =>
      fetcher<Automation>(
        `${AUTOMATIONS_ENDPOINT}/${id}${spaceSlug ? `?spaceSlug=${spaceSlug}` : ''}`
      ),
    enabled: !!id,
  })
}

export const createAutomation = (
  params: AutomationParams,
  spaceSlug?: string
) => {
  const searchParams = spaceSlug ? `?spaceSlug=${spaceSlug}` : ''
  return api.post<Automation>(`${AUTOMATIONS_ENDPOINT}${searchParams}`, params)
}

export const updateAutomation = (
  id: string,
  params: Partial<AutomationParams>,
  spaceSlug?: string
) => {
  const searchParams = spaceSlug ? `?spaceSlug=${spaceSlug}` : ''
  return api.patch<Automation>(
    `${AUTOMATIONS_ENDPOINT}/${id}${searchParams}`,
    params
  )
}

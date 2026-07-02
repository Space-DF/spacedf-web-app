import { DEFAULT_PAGE_SIZE } from '@/constants'
import { TelemetryEvent } from '@/types/event'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils/common'
import { useParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useEvents = (deviceId: string, name?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteQuery<PaginationResponse<TelemetryEvent>>({
    queryKey: [
      ...queryKeys.events.all,
      'device',
      deviceId,
      spaceSlug,
      name,
    ] as const,
    queryFn: ({ pageParam = 0 }) => {
      const offset = (pageParam as number) * DEFAULT_PAGE_SIZE
      return fetcher<PaginationResponse<TelemetryEvent>>(
        `/api/events/device/${deviceId}?spaceSlug=${spaceSlug ?? ''}&search=${name ?? ''}&limit=${DEFAULT_PAGE_SIZE}&offset=${offset}`
      )
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next ? allPages.length : undefined
    },
    enabled: !!spaceSlug && !!deviceId,
  })

  const pages = data?.pages ?? []
  const results = pages.flatMap((p) => p.results ?? [])
  const count = pages[0]?.count

  const hasMore = !!hasNextPage

  return {
    data: {
      count,
      next: pages[pages.length - 1]?.next,
      previous: pages[0]?.previous,
      results,
    } satisfies PaginationResponse<TelemetryEvent>,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore,
    loadMore: () => (hasMore ? fetchNextPage() : Promise.resolve()),
    limit: DEFAULT_PAGE_SIZE,
    mutate: refetch,
    error,
  }
}

import { DEFAULT_PAGE_SIZE } from '@/constants'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils/common'
import { useParams } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Geofence } from '@/types/geofence'
import { queryKeys } from '@/lib/query-keys'

const buildGeofencesUrl = (
  spaceSlug: string,
  offset: number,
  search: string
) => {
  return `/api/geofence?search=${search}&spaceSlug=${spaceSlug}&offset=${offset}&limit=${DEFAULT_PAGE_SIZE}`
}

export const useGeofences = (search?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()

  const queryKey = useMemo(
    () => [...queryKeys.geofences.all, spaceSlug, search] as const,
    [spaceSlug, search]
  )

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    enabled: Boolean(spaceSlug),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      fetcher<PaginationResponse<Geofence>>(
        buildGeofencesUrl(spaceSlug ?? '', pageParam, search ?? '')
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length * DEFAULT_PAGE_SIZE : undefined,
  })

  const geofencesList = useMemo(() => {
    return data?.pages.flatMap((page) => page.results ?? []) ?? []
  }, [data?.pages])

  const setSize = useCallback(
    (sizeOrUpdater: number | ((prevSize: number) => number)) => {
      const prevSize = Math.max(1, data?.pages.length ?? 0)
      const nextSize =
        typeof sizeOrUpdater === 'function'
          ? sizeOrUpdater(prevSize)
          : sizeOrUpdater

      if (nextSize <= 1) {
        const loadedPages = data?.pages.length ?? 0
        if (loadedPages > 1) {
          void queryClient.resetQueries({ queryKey, exact: true })
        }
        return
      }

      if (nextSize > prevSize && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage()
      }
    },
    [
      data?.pages.length,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      queryClient,
      queryKey,
    ]
  )

  const isReachingEnd = !hasNextPage && !isFetching

  return {
    data: geofencesList,
    isReachingEnd,
    isLoading,
    setSize,
    mutate: refetch,
  }
}

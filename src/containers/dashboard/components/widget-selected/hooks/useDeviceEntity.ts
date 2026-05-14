'use client'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import { queryKeys } from '@/lib/query-keys'
import { Entity } from '@/types/entity'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import queryString from 'query-string'
import { useCallback, useMemo } from 'react'

const buildEntitiesUrl = (
  spaceSlug: string,
  offset: number,
  entityType?: string,
  search?: string,
  deviceId?: string
) =>
  queryString.stringifyUrl({
    url: '/api/spaces/entities',
    query: {
      type: entityType,
      spaceSlug,
      search,
      deviceId,
      offset,
      limit: DEFAULT_PAGE_SIZE,
    },
  })

export const useDeviceEntity = (
  entityType?: string,
  search?: string,
  deviceId?: string
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()

  const queryKey = useMemo(
    () =>
      [
        queryKeys.deviceEntities.all,
        spaceSlug,
        entityType ?? '',
        search ?? '',
        deviceId ?? '',
      ] as const,
    [spaceSlug, entityType, search, deviceId]
  )

  const {
    data,
    error,
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
      fetcher<PaginationResponse<Entity>>(
        buildEntitiesUrl(spaceSlug, pageParam, entityType, search, deviceId)
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length : undefined,
  })

  const mergedEntities = useMemo(() => {
    if (!data?.pages.length) return []
    const map = new Map<string, Entity>()
    for (const page of data.pages) {
      for (const entity of page.results ?? []) {
        map.set(entity.id, entity)
      }
    }
    return Array.from(map.values())
  }, [data?.pages])

  const lastPage = data?.pages[data.pages.length - 1]

  const mergedData = useMemo((): PaginationResponse<Entity> | undefined => {
    if (!lastPage) return undefined
    return {
      ...lastPage,
      results: mergedEntities,
    }
  }, [lastPage, mergedEntities])

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

  return {
    data: mergedData,
    isReachingEnd: Boolean(mergedData && !mergedData.next),
    isLoading,
    isValidating: isFetching,
    setSize,
    error,
    refetch,
  }
}

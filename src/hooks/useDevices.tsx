'use client'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import api from '@/lib/api'
import { DeviceDataOriginal } from '@/types/device'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import queryString from 'query-string'

import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const SWR_GET_DEVICE_ENDPOINT = '/api/devices'

export function getDevices<T>(url: string): Promise<T> {
  return api.get(url)
}

export type GetDevicesQuery = {
  deviceName?: string
  bbox?: string
  buildingId?: string
}

function buildDevicesUrl(
  spaceSlug: string,
  offset: number,
  query?: GetDevicesQuery
) {
  return queryString.stringifyUrl({
    url: `${SWR_GET_DEVICE_ENDPOINT}/${spaceSlug}`,
    query: {
      offset,
      limit: 50,
      search: query?.deviceName,
      bbox: query?.bbox,
      buildingId: query?.buildingId,
    },
  })
}

export function useGetDevices(query?: GetDevicesQuery, _configs: unknown = {}) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryKey = [
    ...queryKeys.devices.all,
    spaceSlug,
    query?.deviceName ?? '',
    query?.bbox ?? '',
    query?.buildingId ?? '',
  ]

  const infinite = useInfiniteQuery({
    queryKey,
    enabled: Boolean(spaceSlug),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = typeof pageParam === 'number' ? pageParam : 0
      return getDevices<DeviceDataOriginal[]>(
        buildDevicesUrl(spaceSlug, offset, query)
      )
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined
      if (lastPage.length < DEFAULT_PAGE_SIZE) return undefined
      return allPages.length * DEFAULT_PAGE_SIZE
    },
  })

  const flatData: DeviceDataOriginal[] = useMemo(() => {
    const pages = infinite.data?.pages
    if (!pages) return []
    return pages.flat()
  }, [infinite.data?.pages])

  return {
    data: flatData,
    hasNextPage: !!infinite.hasNextPage,
    fetchNextPage: infinite.fetchNextPage,
    isFetchingNextPage: infinite.isFetchingNextPage,
    isLoading: infinite.isLoading,
    isFetching: infinite.isFetching,
    refetch: infinite.refetch,
    error: infinite.error,
  }
}

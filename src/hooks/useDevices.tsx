import { DEFAULT_PAGE_SIZE } from '@/constants'
import api from '@/lib/api'
import { DeviceDataOriginal } from '@/types/device'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { SWRConfiguration } from 'swr'
import useSWRInfinite from 'swr/infinite'

export const SWR_GET_DEVICE_ENDPOINT = '/api/devices'

export function getDevices<T>(url: string): Promise<T> {
  return api.get(url)
}

type GetDevicesQuery = {
  deviceName?: string
  bbox?: string
}

const getKey = (
  pageIndex: number,
  previousPageData: DeviceDataOriginal[],
  spaceSlug: string,
  query?: GetDevicesQuery
) => {
  // Stop fetching if there is no more data
  if (previousPageData && !previousPageData.length) return null
  const offset = pageIndex * DEFAULT_PAGE_SIZE
  return `${SWR_GET_DEVICE_ENDPOINT}${spaceSlug ? `/${spaceSlug}` : ''}?offset=${offset}&limit=${DEFAULT_PAGE_SIZE}&search=${query?.deviceName || ''}&bbox=${query?.bbox || ''}`
}

export function useGetDevices(
  query?: GetDevicesQuery,
  configs: SWRConfiguration = {}
) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const { data, isLoading, ...rest } = useSWRInfinite(
    (pageIndex, previousPageData) =>
      getKey(pageIndex, previousPageData, spaceSlug, query),
    getDevices<DeviceDataOriginal[]>,
    configs
  )

  const flatData = useMemo(() => {
    if (!data) return []

    const merged = data.flat()

    const map = new Map<string, DeviceDataOriginal>()
    for (const device of merged) {
      map.set(device.id, device)
    }

    return Array.from(map.values())
  }, [data])

  const isReachingEnd = data
    ? data[data.length - 1]?.length < DEFAULT_PAGE_SIZE
    : false
  return { data: flatData, isReachingEnd, isLoading, ...rest }
}

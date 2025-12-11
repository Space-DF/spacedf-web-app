import api from '@/lib/api'
import { DeviceSpace } from '@/types/device-space'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { SWRConfiguration } from 'swr'
import useSWRInfinite from 'swr/infinite'

export const SWR_GET_DEVICE_ENDPOINT = '/api/devices'

export function getDevices<T>(url: string): Promise<T> {
  return api.get(url)
}

const PAGE_SIZE = 10

const getKey = (
  pageIndex: number,
  previousPageData: DeviceSpace[],
  spaceSlug: string
) => {
  // Stop fetching if there is no more data
  if (previousPageData && !previousPageData.length) return null
  const offset = pageIndex * PAGE_SIZE
  return `${SWR_GET_DEVICE_ENDPOINT}${spaceSlug ? `/${spaceSlug}` : ''}?offset=${offset}&limit=${PAGE_SIZE}`
}

export function useGetDevices(configs: SWRConfiguration = {}) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const { data, isLoading, ...rest } = useSWRInfinite(
    (pageIndex, previousPageData) =>
      getKey(pageIndex, previousPageData, spaceSlug),
    getDevices<DeviceSpace[]>,
    configs
  )
  const flatData = useMemo(() => data?.flat(), [data])
  const isReachingEnd = data ? data[data.length - 1]?.length < PAGE_SIZE : false
  return { data: flatData, isReachingEnd, isLoading, ...rest }
}

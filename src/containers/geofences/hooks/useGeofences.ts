import { DEFAULT_PAGE_SIZE } from '@/constants'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils/common'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import { Geofence } from '@/types/geofence'

const getKey = (
  pageIndex: number,
  previousPageData: PaginationResponse<Geofence> | null,
  spaceSlug: string,
  search: string
) => {
  if (!spaceSlug) return null
  if (
    previousPageData &&
    (previousPageData.results?.length ?? 0) < DEFAULT_PAGE_SIZE
  )
    return null
  const offset = pageIndex * DEFAULT_PAGE_SIZE
  return `/api/geofence?search=${search}&spaceSlug=${spaceSlug}&offset=${offset}&limit=${DEFAULT_PAGE_SIZE}`
}

export const useGeofences = (search?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const { data, isLoading, setSize, mutate, ...rest } = useSWRInfinite(
    (pageIndex, previousPageData) =>
      getKey(pageIndex, previousPageData, spaceSlug ?? '', search ?? ''),
    fetcher<PaginationResponse<Geofence>>,
    { revalidateFirstPage: false }
  )

  const geofencesList = useMemo(
    () => data?.flatMap((page) => page.results ?? []) ?? [],
    [data]
  )

  const isReachingEnd =
    !data ||
    data.length === 0 ||
    (data[data.length - 1]?.results?.length ?? 0) < DEFAULT_PAGE_SIZE

  return {
    data: geofencesList,
    isReachingEnd,
    isLoading,
    setSize,
    mutate,
    ...rest,
  }
}

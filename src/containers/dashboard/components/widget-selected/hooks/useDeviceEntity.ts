import { DEFAULT_PAGE_SIZE } from '@/constants'
import { Entity } from '@/types/entity'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'

const getEntityKey = (
  pageIndex: number,
  previousPageData: PaginationResponse<Entity> | null,
  spaceSlug: string,
  entityType?: string,
  search?: string,
  deviceId?: string
) => {
  if (previousPageData && !previousPageData.next) return null
  const page = pageIndex + 1
  return `/api/spaces/entities?type=${entityType ?? ''}&spaceSlug=${spaceSlug}&search=${search ?? ''}&deviceId=${deviceId ?? ''}&offset=${page - 1}&limit=${DEFAULT_PAGE_SIZE}`
}

export const useDeviceEntity = (
  entityType?: string,
  search?: string,
  deviceId?: string
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const { data, ...rest } = useSWRInfinite(
    (pageIndex, previousPageData) =>
      spaceSlug
        ? getEntityKey(
            pageIndex,
            previousPageData,
            spaceSlug,
            entityType,
            search,
            deviceId
          )
        : null,
    fetcher<PaginationResponse<Entity>>
  )

  const mergedEntities = useMemo(() => {
    if (!data) return []
    const map = new Map<string, Entity>()
    for (const page of data) {
      for (const entity of page.results ?? []) {
        map.set(entity.id, entity)
      }
    }
    return Array.from(map.values())
  }, [data])

  const lastPage = data?.[data.length - 1]

  return {
    data: lastPage
      ? {
          ...lastPage,
          results: mergedEntities,
        }
      : undefined,
    isReachingEnd: Boolean(data && !lastPage?.next),
    ...rest,
  }
}

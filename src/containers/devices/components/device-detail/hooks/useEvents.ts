import { DEFAULT_PAGE_SIZE } from '@/constants'
import { useDebounce } from '@/hooks/useDebounce'
import { TelemetryEvent } from '@/types/event'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils/common'
import { useParams } from 'next/navigation'
import useSWRInfinite from 'swr/infinite'

export const useEvents = (deviceId: string, name?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const debouncedName = useDebounce(name, 500)

  const swr = useSWRInfinite<PaginationResponse<TelemetryEvent>>(
    (pageIndex, previousPageData) => {
      if (!spaceSlug || !deviceId) return null
      if (previousPageData && previousPageData.results.length === 0) return null

      const offset = pageIndex * DEFAULT_PAGE_SIZE
      return `/api/events/device/${deviceId}?spaceSlug=${spaceSlug ?? ''}&search=${debouncedName ?? ''}&limit=${DEFAULT_PAGE_SIZE}&offset=${offset}`
    },
    fetcher<PaginationResponse<TelemetryEvent>>,
    {
      revalidateFirstPage: false,
      revalidateAll: true,
    }
  )

  const pages = swr.data ?? []
  const results = pages.flatMap((p) => p.results ?? [])
  const count = pages[0]?.count
  const isLoadingInitial = !swr.data && !swr.error
  const isLoadingMore =
    isLoadingInitial ||
    (swr.size > 0 &&
      Boolean(swr.data) &&
      typeof swr.data?.[swr.size - 1] === 'undefined')

  const hasMore =
    typeof count === 'number'
      ? results.length < count
      : Boolean(pages[pages.length - 1]?.next)

  return {
    ...swr,
    data: {
      count,
      next: pages[pages.length - 1]?.next,
      previous: pages[0]?.previous,
      results,
    } satisfies PaginationResponse<TelemetryEvent>,
    isLoading: isLoadingInitial,
    isLoadingMore,
    hasMore,
    loadMore: () => (hasMore ? swr.setSize((s) => s + 1) : Promise.resolve()),
    limit: DEFAULT_PAGE_SIZE,
  }
}

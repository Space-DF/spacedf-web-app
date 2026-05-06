import useSWR from 'swr'
import { fetcher } from '@/utils'
import { PaginationResponse } from '@/types/global'
import { Building } from '@/types/building'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/stores'
import queryString from 'query-string'

export const useBuilding = (
  params: {
    limit?: number
    offset?: number
  } = {}
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  const key = queryString.stringifyUrl({
    url: `/api/building`,
    query: {
      limit: params.limit,
      offset: params.offset,
      spaceSlug: spaceSlugName,
    },
  })
  return useSWR(
    spaceSlugName ? key : null,
    fetcher<PaginationResponse<Building>>
  )
}

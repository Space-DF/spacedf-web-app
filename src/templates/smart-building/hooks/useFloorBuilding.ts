import { Floor } from '@/types/floor'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import queryString from 'query-string'
import useSWR from 'swr'

type UseFloorBuildingParams = {
  limit?: number
  offset?: number
}

export const useFloorBuilding = (
  buildingId?: string,
  params: UseFloorBuildingParams = {}
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const key = queryString.stringifyUrl({
    url: `/api/building/${buildingId}/floor`,
    query: {
      limit: params.limit,
      offset: params.offset,
      spaceSlug: spaceSlug,
    },
  })
  return useSWR(buildingId ? key : null, fetcher<PaginationResponse<Floor>>)
}

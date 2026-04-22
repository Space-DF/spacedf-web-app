import { useShowDummyData } from '@/hooks/useShowDummyData'
import { useGlobalStore } from '@/stores'
import { Area } from '@/types/area'
import { Building } from '@/types/building'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import queryString from 'query-string'
import useSWR from 'swr'

type PaginationParams = {
  limit?: number
  offset?: number
}

type UseAreaAndBuildingParams = {
  area?: PaginationParams
  building?: PaginationParams
}

export const useAreaAndBuilding = (params: UseAreaAndBuildingParams = {}) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  const showDummyData = useShowDummyData()
  const areaKey = queryString.stringifyUrl({
    url: '/api/area',
    query: {
      limit: params.area?.limit,
      offset: params.area?.offset,
      spaceSlug: spaceSlugName,
    },
  })

  const buildingKey = queryString.stringifyUrl({
    url: '/api/building',
    query: {
      limit: params.building?.limit,
      offset: params.building?.offset,
      spaceSlug: spaceSlugName,
    },
  })

  return useSWR(
    showDummyData ? null : ([areaKey, buildingKey] as const),
    async ([areaUrl, buildingUrl]) => {
      const [area, building] = await Promise.all([
        fetcher<PaginationResponse<Area>>(areaUrl),
        fetcher<PaginationResponse<Building>>(buildingUrl),
      ])

      return { area, building }
    }
  )
}

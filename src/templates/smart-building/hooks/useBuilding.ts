import { useQuery } from '@tanstack/react-query'
import queryString from 'query-string'

import { queryKeys } from '@/lib/query-keys'
import type { Building } from '@/types/building'
import type { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useSpaceSlug } from '@/hooks'

export type BuildingsListParams = {
  limit?: number
  offset?: number
}

export function getBuildingsListUrl(
  spaceSlug: string,
  params: BuildingsListParams = {}
) {
  return queryString.stringifyUrl({
    url: '/api/building',
    query: {
      limit: params.limit,
      offset: params.offset,
      spaceSlug,
    },
  })
}

export function patchBuildingsListCache(
  current: PaginationResponse<Building> | undefined,
  saved: Building,
  mode: 'create' | 'edit'
): PaginationResponse<Building> {
  if (!current) {
    return { results: [saved], count: 1 }
  }

  if (mode === 'edit') {
    return {
      ...current,
      results: current.results.map((building) =>
        building.id === saved.id ? saved : building
      ),
    }
  }

  return {
    ...current,
    count: (current.count ?? current.results.length) + 1,
    results: [saved, ...current.results],
  }
}

export function removeBuildingFromListCache(
  current: PaginationResponse<Building> | undefined,
  buildingId: string
): PaginationResponse<Building> | undefined {
  if (!current) return current

  const nextResults = current.results.filter(
    (building) => building.id !== buildingId
  )

  return {
    ...current,
    count: Math.max(0, (current.count ?? current.results.length) - 1),
    results: nextResults,
  }
}

export const useBuilding = (params: BuildingsListParams = {}) => {
  const spaceSlugName = useSpaceSlug()

  return useQuery({
    queryKey: queryKeys.buildings.list(spaceSlugName, params),
    queryFn: () =>
      fetcher<PaginationResponse<Building>>(
        getBuildingsListUrl(spaceSlugName, params)
      ),
    enabled: !!spaceSlugName,
  })
}

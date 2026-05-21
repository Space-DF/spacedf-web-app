import { queryKeys } from '@/lib/query-keys'
import { DataResponse, PaginationResponse } from '@/types/global'
import { Space } from '@/types/space'
import { fetcher } from '@/utils'
import { useQuery } from '@tanstack/react-query'

export type UseGetSpaceResponse = DataResponse<Space>

export const SWR_GET_SPACE_ENDPOINT = '/api/spaces'

type SpaceDetailsResponse = { data: PaginationResponse<Space> }

export function useGetSpaces() {
  return useQuery({
    queryKey: queryKeys.spaces.list(),
    queryFn: () => fetcher<DataResponse<Space>>(SWR_GET_SPACE_ENDPOINT),
  })
}

export function useGetSpaceDetails(slug: string) {
  return useQuery({
    queryKey: queryKeys.spaces.detail(slug),
    queryFn: () =>
      fetcher<SpaceDetailsResponse>(`${SWR_GET_SPACE_ENDPOINT}/${slug}`),
    enabled: !!slug,
  })
}

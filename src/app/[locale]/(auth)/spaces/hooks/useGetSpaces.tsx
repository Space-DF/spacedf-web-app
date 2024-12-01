import { DataResponse } from '@/types/global'
import { Space } from '@/types/space'
import useSWR, { Fetcher, SWRConfiguration } from 'swr'

export type UseGetSpaceResponse = DataResponse<Space>

export const SWR_GET_SPACE_ENDPOINT = '/api/spaces'

export function useGetSpaces<UseGetSpaceResponse>(
  configs: SWRConfiguration = {},
  fetcher: Fetcher<UseGetSpaceResponse> | null = null,
) {
  return useSWR(SWR_GET_SPACE_ENDPOINT, fetcher, configs)
}

import api from '@/lib/api'
import { DataResponse, PaginationResponse } from '@/types/global'
import { Space } from '@/types/space'
import useSWR, { SWRConfiguration } from 'swr'

export type UseGetSpaceResponse = DataResponse<Space>

export const SWR_GET_SPACE_ENDPOINT = '/api/spaces'

export async function getSpaces<T>(url: string): Promise<T> {
  return api.get(url)
}

export function useGetSpaces(configs: SWRConfiguration = {}) {
  return useSWR(SWR_GET_SPACE_ENDPOINT, getSpaces<UseGetSpaceResponse>, configs)
}

export function useGetSpaceDetails(slug: string) {
  return useSWR(
    `${SWR_GET_SPACE_ENDPOINT}/${slug}`,
    getSpaces<{ data: PaginationResponse<Space> }>
  )
}

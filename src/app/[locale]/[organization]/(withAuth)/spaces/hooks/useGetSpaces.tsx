import {
  ApiErrorResponse,
  DataResponse,
  PaginationResponse,
} from '@/types/global'
import { Space } from '@/types/space'
import useSWR, { SWRConfiguration } from 'swr'

export type UseGetSpaceResponse = DataResponse<Space>

export const SWR_GET_SPACE_ENDPOINT = '/api/spaces'

export async function getSpaces<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to update space')
  }

  return response.json()
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

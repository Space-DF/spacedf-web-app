import { ApiErrorResponse, Response } from '@/types/global'
import useSWR, { SWRConfiguration } from 'swr'
import queryString, { StringifiableRecord } from 'query-string'
import { Organization } from '@/types/organization'

export type UseGetOrganizationsResponse = Response<Organization>

export const SWR_GET_ORGANIZATION_ENDPOINT = '/api/console/organization'

interface Options {
  search?: string
  ordering?: string
}

export async function getOrganizations<T>(
  url: string,
  options?: Options
): Promise<T> {
  const response = await fetch(
    queryString.stringifyUrl({ url, query: options as StringifiableRecord })
  )

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to get organization')
  }

  return response.json()
}

export function useGetOrganizations(
  options: Options,
  configs: SWRConfiguration = {}
) {
  return useSWR(
    [SWR_GET_ORGANIZATION_ENDPOINT, options?.search],
    (url) => getOrganizations<UseGetOrganizationsResponse>(url[0], options),
    configs
  )
}

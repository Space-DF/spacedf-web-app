import { ApiErrorResponse, ApiResponse } from '@/types/global'
import useSWRMutation from 'swr/mutation'

export type UseGetOrganizationsResponse = ApiResponse<{
  response_data: {
    id: string
    created_at: string
    updated_at: string
    name: string
    logo: string
    slug_name: string
    is_active: boolean
    oauth2_redirect_uris: string
    template: string
    api_key: string
  }
  status: number
}>

export const SWR_POST_ORGANIZATION_ENDPOINT = '/api/console/organization'

interface Options {
  name: string
  logo: string
  slug_name: string
  oauth2_redirect_uris?: string
  template?: string
}

export async function createOrganization<T>(
  url: string,
  { arg }: { arg: Options }
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to get organization')
  }

  return response.json()
}

export function useCreateOrganization() {
  return useSWRMutation(
    SWR_POST_ORGANIZATION_ENDPOINT,
    createOrganization<UseGetOrganizationsResponse>
  )
}

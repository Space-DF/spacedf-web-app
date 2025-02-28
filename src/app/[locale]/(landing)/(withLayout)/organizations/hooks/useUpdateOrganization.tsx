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

export const SWR_POST_ORGANIZATION_ENDPOINT = '/api/console/organization/id'

interface Options {
  id: string
  name: string
  logo: string
  slug_name: string
  oauth2_redirect_uris?: string
  template?: string
  is_active?: boolean
}

export async function updateOrganization<T>(
  url: string,
  { arg }: { arg: Options }
): Promise<T> {
  const { id, ...body } = arg
  const response = await fetch(url.replace('/id', `/${id}`), {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to get organization')
  }

  return response.json()
}

export function useUpdateOrganization() {
  return useSWRMutation(
    SWR_POST_ORGANIZATION_ENDPOINT,
    updateOrganization<UseGetOrganizationsResponse>
  )
}

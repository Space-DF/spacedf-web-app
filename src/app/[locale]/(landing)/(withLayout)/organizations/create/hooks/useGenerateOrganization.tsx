import { ApiErrorResponse, ApiResponse } from '@/types/global'
import useSWRMutation from 'swr/mutation'

export const SWR_GET_ORGANIZATION_ENDPOINT =
  '/api/console/organization/generate-slug'

export type OrganizationSlug = {
  generated_slug_name: string
  original_name: string
}

type UseGenerateOrganizationsResponse = ApiResponse<{
  response_data: OrganizationSlug
  status: number
}>

interface Options {
  name: string
}

export async function generateOrganizations<T>(
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

export function useGenerateOrganization() {
  return useSWRMutation(
    SWR_GET_ORGANIZATION_ENDPOINT,
    generateOrganizations<UseGenerateOrganizationsResponse>
  )
}

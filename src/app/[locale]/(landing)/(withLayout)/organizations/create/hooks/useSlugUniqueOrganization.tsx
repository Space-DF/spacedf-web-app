import { ApiErrorResponse } from '@/types/global'
import useSWRMutation from 'swr/mutation'

export const SWR_GET_ORGANIZATION_ENDPOINT =
  '/api/console/organization/check-slug-unique'

interface Options {
  payload: {
    slug_name: string
  }
  headers: {
    Authorization: string
  }
}

export async function checkSlugOrganization<T>(
  url: string,
  { arg }: { arg: Options }
): Promise<T> {
  const { payload, headers } = arg
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to get organization')
  }

  return response.json()
}

export function useCheckSlugUniqueOrganization() {
  return useSWRMutation(SWR_GET_ORGANIZATION_ENDPOINT, checkSlugOrganization)
}

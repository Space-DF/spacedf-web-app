import { ApiErrorResponse } from '@/types/global'
import useSWR, { SWRConfiguration } from 'swr'

export const SWR_GET_WIDGETS_ENDPOINT = '/api/dashboard/widgets'

export async function getWidgets<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to get dashboard')
  }

  return response.json()
}

export function useGetWidgets(configs: SWRConfiguration = {}) {
  return useSWR(SWR_GET_WIDGETS_ENDPOINT, getWidgets<any[]>, configs)
}

import api from '@/lib/api'
import useSWR, { SWRConfiguration } from 'swr'

export const SWR_GET_WIDGETS_ENDPOINT = '/api/dashboard/widgets'

export function getWidgets<T>(url: string): Promise<T> {
  return api.get(url)
}

export function useGetWidgets(configs: SWRConfiguration = {}) {
  return useSWR(SWR_GET_WIDGETS_ENDPOINT, getWidgets<any[]>, configs)
}

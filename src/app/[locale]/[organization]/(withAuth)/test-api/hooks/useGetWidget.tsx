import api from '@/lib/api'
import { WidgetLayout } from '@/types/widget'
import useSWR, { SWRConfiguration } from 'swr'

export const SWR_GET_WIDGETS_ENDPOINT = '/api/dashboard/widgets'

export function getWidgets<T>(url: string): Promise<T> {
  return api.get(url)
}

export function useGetWidgets(
  dashboardId?: string,
  configs: SWRConfiguration = {}
) {
  return useSWR(
    dashboardId ? `${SWR_GET_WIDGETS_ENDPOINT}/${dashboardId}` : null,
    getWidgets<WidgetLayout>,
    configs
  )
}

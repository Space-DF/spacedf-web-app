import api from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { WidgetLayout } from '@/types/widget'
import { useParams } from 'next/navigation'
import useSWR, { SWRConfiguration } from 'swr'

export const SWR_GET_WIDGETS_ENDPOINT = '/api/dashboard'

export function getWidgets<T>(url: string): Promise<T> {
  return api.get(url)
}

export function useGetWidgets(
  dashboardId?: string,
  configs: SWRConfiguration = {}
) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  return useSWR(
    dashboardId
      ? `${SWR_GET_WIDGETS_ENDPOINT}/${spaceSlugName}/widgets/${dashboardId}`
      : null,
    getWidgets<WidgetLayout[]>,
    configs
  )
}

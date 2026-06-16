import { api } from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { WidgetLayout } from '@/types/widget'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

export const SWR_GET_WIDGETS_ENDPOINT = '/api/dashboard'

export function getWidgets<T>(url: string): Promise<T> {
  return api.get(url)
}

export function useGetWidgets(dashboardId?: string) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  const storeDashboardId = useDashboardStore((state) => state.dashboard?.id)

  const resolvedDashboardId = dashboardId || storeDashboardId

  const queryKey = resolvedDashboardId
    ? [SWR_GET_WIDGETS_ENDPOINT, spaceSlugName, 'widgets', resolvedDashboardId]
    : null

  const { data, refetch } = useQuery({
    queryKey: queryKey || ['widgets-disabled'],
    queryFn: () =>
      getWidgets<WidgetLayout[]>(
        `${SWR_GET_WIDGETS_ENDPOINT}/${spaceSlugName}/widgets/${resolvedDashboardId}`
      ),
    enabled: !!resolvedDashboardId,
  })

  return { data, mutate: refetch }
}

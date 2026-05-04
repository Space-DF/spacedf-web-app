import { api } from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const deleteWidget = (url: string, { arg }: { arg: { widgetId: string } }) => {
  return api.delete(`${url}/${arg.widgetId}`)
}

export const useDeleteWidget = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  const dashboardId = useDashboardStore((state) => state.dashboard?.id)

  return useSWRMutation(
    dashboardId && spaceSlugName
      ? `/api/dashboard/${spaceSlugName}/widgets/${dashboardId}`
      : null,
    deleteWidget
  )
}

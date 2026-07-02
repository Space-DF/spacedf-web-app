import { api } from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useDeleteWidget = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  const dashboardId = useDashboardStore((state) => state.dashboard?.id)
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<
    void,
    Error,
    { widgetId: string }
  >({
    mutationFn: async (arg) => {
      if (!dashboardId || !spaceSlugName) return
      return api.delete(
        `/api/dashboard/${spaceSlugName}/widgets/${dashboardId}/${arg.widgetId}`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/dashboard', spaceSlugName, 'widgets', dashboardId],
      })
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

import { api } from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useUpdateWidgets = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  const dashboardId = useDashboardStore((state) => state.dashboard?.id)
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<any, Error, any>({
    mutationFn: async (arg) => {
      return api.put(
        `/api/dashboard/${spaceSlugName}/widgets/${dashboardId}`,
        arg
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

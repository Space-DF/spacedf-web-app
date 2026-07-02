import { api } from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useParams } from 'next/navigation'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

export const useCreateWidget = (
  options?: UseMutationOptions<any, any, { configuration: any }>
) => {
  const dashboardId = useDashboardStore((state) => state.dashboard?.id)
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name

  const { mutate, isPending } = useMutation({
    mutationFn: (arg: { configuration: any }) =>
      api.post(`/api/dashboard/${spaceSlugName}/widgets/${dashboardId}`, arg),
    ...options,
  })

  return { createWidget: mutate, isMutating: isPending }
}

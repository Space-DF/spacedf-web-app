import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { SWR_GET_WIDGETS_ENDPOINT } from './useGetWidget'
import api from '@/lib/api'
import { WidgetLayout } from '@/types/widget'

export const useDeleteWidget = () => {
  const queryClient = useQueryClient()
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  const dashboardId = useDashboardStore((state) => state.dashboard?.id)

  const queryKey = dashboardId
    ? [SWR_GET_WIDGETS_ENDPOINT, spaceSlugName, 'widgets', dashboardId]
    : null

  const { mutate, isPending } = useMutation({
    mutationFn: (arg: Partial<{ widgetId: string }>) =>
      api.delete('/api/dashboard/widgets', {
        body: JSON.stringify(arg),
      }),
    onSuccess(data: any) {
      const idDeleted = data?.idDeleted
      if (idDeleted && queryKey) {
        queryClient.setQueryData<WidgetLayout[]>(queryKey, (prevWidgets) => {
          if (!prevWidgets) return []
          return prevWidgets.filter((widget) => widget.id !== idDeleted)
        })
      }
      toast.success('Widgets updated successfully')
    },
    onError: (error: any) => {
      try {
        const errors = JSON.parse(error.message)
        const isSlugError = 'slug_name' in errors

        if (!isSlugError) {
          toast.error(errors.detail || 'Something went wrong')
        } else {
          toast(
            <ul className="space-y-1 font-medium text-brand-semantic-accent-300">
              {errors.slug_name.map((error: string) => (
                <li key={error} className="capitalize">
                  {error}
                </li>
              ))}
            </ul>
          )
        }
      } catch {
        toast.error(error.message || 'Something went wrong')
      }
    },
  })

  return { deleteWidget: mutate, isMutating: isPending }
}

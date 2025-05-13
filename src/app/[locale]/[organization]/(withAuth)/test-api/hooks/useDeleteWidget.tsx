import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { useGetWidgets } from './useGetWidget'
import api from '@/lib/api'

export function deleteWidget(
  url: string,
  {
    arg,
  }: {
    arg: Partial<{
      widgetId: string
    }>
  }
) {
  return api.delete(url, {
    body: JSON.stringify(arg),
  })
}

export const useDeleteWidget = () => {
  const { mutate } = useGetWidgets()

  const { trigger } = useSWRMutation('/api/dashboard/widgets', deleteWidget, {
    onSuccess({ idDeleted }: any) {
      mutate((prevWidgets: any) => {
        const newWidgets = prevWidgets.filter(
          (widget: any) => widget.id !== idDeleted
        )

        return newWidgets
      }, false)

      toast.success('Widgets updated successfully')
    },
    onError: (error) => {
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
    },
    revalidate: false,
  })

  return { deleteWidget: trigger }
}

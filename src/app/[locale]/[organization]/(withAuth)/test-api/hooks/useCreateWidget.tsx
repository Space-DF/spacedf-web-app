import { ApiErrorResponse } from '@/types/global'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { useGetWidgets } from './useGetWidget'

export async function createWidget(
  url: string,
  { arg }: { arg: Partial<any> }
) {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to create widget')
  }

  return response.json()
}

export const useCreateWidget = (
  onSuccessCallback?: (newWidgetId: string) => void
) => {
  const { mutate } = useGetWidgets()

  const { trigger } = useSWRMutation('/api/dashboard/widgets', createWidget, {
    onSuccess(newWidget) {
      mutate((prevData: any) => {
        const newData: any = [...prevData, newWidget]
        return newData
      }, false)
      if (onSuccessCallback) return onSuccessCallback(newWidget.id)
      toast.success('Widget created successfully')
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

  return { createWidget: trigger }
}

import { ApiErrorResponse } from '@/types/global'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { useGetWidgets } from './useGetWidget'

export async function updateWidgets(
  url: string,
  { arg }: { arg: Partial<any> }
) {
  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to updates widgets')
  }

  return response.json()
}

export const useUpdateWidgets = () => {
  const { mutate } = useGetWidgets()

  const { trigger } = useSWRMutation('/api/dashboard/widgets', updateWidgets, {
    onSuccess(newWidgets) {
      mutate(() => {
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

  return { updateWidgets: trigger }
}

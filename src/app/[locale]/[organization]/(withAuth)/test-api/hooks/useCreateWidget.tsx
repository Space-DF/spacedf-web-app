import { ApiErrorResponse } from '@/types/global'
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation'

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
  options: SWRMutationConfiguration<any, any, string> = {}
) => {
  const { trigger } = useSWRMutation('/api/dashboard/widgets', createWidget, {
    ...options,
  })

  return { createWidget: trigger }
}

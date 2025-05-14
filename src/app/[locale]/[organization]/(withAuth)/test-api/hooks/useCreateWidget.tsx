import api from '@/lib/api'
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation'

export function createWidget(url: string, { arg }: { arg: Partial<any> }) {
  return api.post(url, arg)
}

export const useCreateWidget = (
  options: SWRMutationConfiguration<any, any, string> = {}
) => {
  const { trigger } = useSWRMutation('/api/dashboard/widgets', createWidget, {
    ...options,
  })

  return { createWidget: trigger }
}

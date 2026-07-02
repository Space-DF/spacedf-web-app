import { useParams } from 'next/navigation'
import { AutomationParams } from '@/types/automation'
import api from '@/lib/api'
import { Automation } from '@/types/automation'
import { useMutation } from '@tanstack/react-query'

export const useUpdateAutomation = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const mutation = useMutation<Automation, Error, AutomationParams>({
    mutationFn: (arg: AutomationParams) => {
      if (!id) return Promise.reject(new Error('No automation ID provided'))
      return api.patch(`/api/automations/${id}?spaceSlug=${spaceSlug}`, arg)
    },
  })

  return {
    trigger: mutation.mutateAsync,
    isMutating: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  }
}

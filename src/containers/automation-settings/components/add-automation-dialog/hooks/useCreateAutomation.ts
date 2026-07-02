import api from '@/lib/api'
import { Automation, AutomationParams } from '@/types/automation'
import { useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

export const useCreateAutomation = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const mutation = useMutation<Automation, Error, AutomationParams>({
    mutationFn: (arg: AutomationParams) => {
      const searchParams = spaceSlug ? `?spaceSlug=${spaceSlug}` : ''
      return api.post<Automation>(`/api/automations${searchParams}`, arg)
    },
  })

  return {
    trigger: mutation.mutateAsync,
    isMutating: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  }
}

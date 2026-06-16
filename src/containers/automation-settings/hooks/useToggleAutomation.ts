import api from '@/lib/api'
import { Automation, AutomationParams } from '@/types/automation'
import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useToggleAutomation = (id: string, spaceSlug?: string) => {
  const t = useTranslations('automation')

  const mutation = useMutation<Automation, Error, Partial<AutomationParams>>({
    mutationFn: (arg: Partial<AutomationParams>) =>
      api.patch<Automation>(
        `/api/automations/${id}${spaceSlug ? `?spaceSlug=${spaceSlug}` : ''}`,
        arg
      ),
    onError: (error: any) => {
      toast.error(error?.message || t('automation_update_failed'))
    },
  })

  return {
    trigger: mutation.mutateAsync,
    isMutating: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  }
}

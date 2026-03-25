import api from '@/lib/api'
import { Automation, AutomationParams } from '@/types/automation'
import { useTranslations } from 'next-intl'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'

const toggleAutomation = (
  url: string,
  { arg }: { arg: Partial<AutomationParams> }
) => api.patch<Automation>(url, arg)

export const useToggleAutomation = (id: string, spaceSlug?: string) => {
  const t = useTranslations('automation')
  const url = `/api/automations/${id}${spaceSlug ? `?spaceSlug=${spaceSlug}` : ''}`

  return useSWRMutation(url, toggleAutomation, {
    onError: (error) => {
      toast.error(error?.message || t('automation_update_failed'))
    },
  })
}

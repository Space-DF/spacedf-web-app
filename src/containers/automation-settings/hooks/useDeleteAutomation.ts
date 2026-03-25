import api from '@/lib/api'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

const deleteAutomation = async (url: string) => {
  return api.delete(url)
}

export const useDeleteAutomation = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('automation')

  return useSWRMutation(
    id ? `/api/automations/${id}?spaceSlug=${spaceSlug}` : null,
    deleteAutomation,
    {
      onSuccess: () => {
        toast.success(t('automation_deleted_successfully'))
      },
      onError: (error) => {
        toast.error(error?.message || t('automation_delete_failed'))
      },
    }
  )
}

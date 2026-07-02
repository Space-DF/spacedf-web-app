import api from '@/lib/api'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'

export const useDeleteAutomation = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('automation')

  const mutation = useMutation<any, Error, void>({
    mutationFn: () => {
      if (!id) return Promise.reject(new Error('No automation ID provided'))
      return api.delete(`/api/automations/${id}?spaceSlug=${spaceSlug}`)
    },
    onSuccess: () => {
      toast.success(t('automation_deleted_successfully'))
    },
    onError: (error: any) => {
      toast.error(error?.message || t('automation_delete_failed'))
    },
  })

  return {
    trigger: mutation.mutateAsync,
    isMutating: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  }
}

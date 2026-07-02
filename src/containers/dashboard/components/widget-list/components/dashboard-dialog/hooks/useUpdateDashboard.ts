import api from '@/lib/api'
import { Dashboard } from '@/types/dashboard'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useUpdateDashboard = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()
  const t = useTranslations('dashboard')

  const { mutateAsync, isPending } = useMutation<
    Dashboard,
    Error,
    { name: string; id: string }
  >({
    mutationFn: async (arg) => {
      return api.patch(`/api/dashboard/${spaceSlug}/${arg.id}`, arg)
    },
    onSuccess: () => {
      toast.success(t('dashboard_updated_successfully'))
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.all })
    },
    onError: (error) => {
      toast.error(error.message || t('dashboard_update_failed'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

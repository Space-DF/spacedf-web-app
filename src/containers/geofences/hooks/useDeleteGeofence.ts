import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { useTranslations } from 'next-intl'

export const useDeleteGeofence = (id: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('geofence')

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => api.delete(`/api/geofence/${id}/?spaceSlug=${spaceSlug}`),
    onSuccess: () => {
      toast.success(t('geofence_deleted_successfully'))
    },
    onError: (error: any) => {
      toast.error(error.message || t('geofence_deleted_error'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

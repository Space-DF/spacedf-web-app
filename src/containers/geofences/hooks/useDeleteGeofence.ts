import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { useTranslations } from 'next-intl'

const deleteGeofence = async (url: string) => api.delete(url)

export const useDeleteGeofence = (id: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('geofence')
  return useSWRMutation(
    `/api/geofence/${id}/?spaceSlug=${spaceSlug}`,
    deleteGeofence,
    {
      onSuccess: () => {
        toast.success(t('geofence_deleted_successfully'))
      },
      onError: (error) => {
        toast.error(error.message || t('geofence_deleted_error'))
      },
    }
  )
}

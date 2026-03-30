import api from '@/lib/api'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'
import { CreateGeofencePayload } from './useAddGeofence'
import { toast } from 'sonner'
import { useCache } from '@/hooks/useCache'

interface UpdateGeofencePayload extends CreateGeofencePayload {
  id: string
}

const updateGeofence = async (
  url: string,
  { arg }: { arg: UpdateGeofencePayload }
) => api.patch(`${url}/${arg.id}`, arg)

export const useUpdateGeofence = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const { clearCacheStartsWith } = useCache()
  const t = useTranslations('geofence')
  return useSWRMutation(
    id ? `/api/geofence/${id}?spaceSlug=${spaceSlug}` : null,
    updateGeofence,
    {
      onSuccess: () => {
        toast.success(t('geofence_updated_successfully'))
        clearCacheStartsWith('/api/events')
      },
      onError: (error) => {
        toast.error(error.message || t('geofence_updated_error'))
      },
    }
  )
}

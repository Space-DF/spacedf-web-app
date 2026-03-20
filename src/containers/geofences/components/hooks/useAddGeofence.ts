import api from '@/lib/api'
import { EventRule, PolygonGeometry } from '@/types/geofence'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

export interface CreateGeofencePayload extends EventRule {
  features: PolygonGeometry[]
  name: string
  color: string
  type_zone: 'safe' | 'danger'
}

const addGeofence = async (
  url: string,
  { arg }: { arg: CreateGeofencePayload }
) => api.post(url, arg)

export const useAddGeofence = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('geofence')
  return useSWRMutation(`/api/geofence?spaceSlug=${spaceSlug}`, addGeofence, {
    onSuccess: () => {
      toast.success(t('geofence_added_successfully'))
    },
    onError: (error) => {
      toast.error(error.message || t('geofence_added_error'))
    },
  })
}

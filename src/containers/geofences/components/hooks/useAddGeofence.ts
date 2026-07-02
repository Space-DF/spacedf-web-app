import api from '@/lib/api'
import { EventRule, PolygonGeometry } from '@/types/geofence'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'

export interface CreateGeofencePayload extends EventRule {
  features: PolygonGeometry[]
  name: string
  color: string
  type_zone: 'safe' | 'danger'
}

export const useAddGeofence = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('geofence')

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (arg: CreateGeofencePayload) =>
      api.post(`/api/geofence?spaceSlug=${spaceSlug}`, arg),
    onSuccess: () => {
      toast.success(t('geofence_added_successfully'))
    },
    onError: (error: any) => {
      toast.error(error.message || t('geofence_added_error'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

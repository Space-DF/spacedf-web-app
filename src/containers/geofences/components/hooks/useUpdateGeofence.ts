import api from '@/lib/api'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateGeofencePayload } from './useAddGeofence'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'

interface UpdateGeofencePayload extends CreateGeofencePayload {
  id: string
}

export const useUpdateGeofence = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()
  const t = useTranslations('geofence')

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (arg: UpdateGeofencePayload) =>
      api.patch(`/api/geofence/${id}?spaceSlug=${spaceSlug}`, arg),
    onSuccess: () => {
      toast.success(t('geofence_updated_successfully'))
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
    },
    onError: (error: any) => {
      toast.error(error.message || t('geofence_updated_error'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

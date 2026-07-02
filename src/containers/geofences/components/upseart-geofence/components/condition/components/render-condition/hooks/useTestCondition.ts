import api from '@/lib/api'
import { GeofenceTestPayload } from '@/types/geofence'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

export const useTestCondition = () => {
  const { spaceSlug } = useParams()
  const t = useTranslations('geofence')

  const mutation = useMutation({
    mutationFn: (arg: GeofenceTestPayload) =>
      api.post(`/api/geofence/test?spaceSlug=${spaceSlug}`, arg),
    onSuccess: () => {
      toast.success(t('geofence_test_passed'))
    },
    onError: (error: any) => {
      toast.error(error.message || t('geofence_test_failed'))
    },
  })

  return {
    trigger: mutation.mutate,
    isMutating: mutation.isPending,
  }
}

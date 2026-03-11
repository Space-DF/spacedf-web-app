import api from '@/lib/api'
import { GeofenceTestPayload } from '@/types/geofence'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

const testGeofence = (
  url: string,
  {
    arg,
  }: {
    arg: GeofenceTestPayload
  }
) => api.post(url, arg)

export const useTestCondition = () => {
  const { spaceSlug } = useParams()
  const t = useTranslations('geofence')
  return useSWRMutation(
    `/api/geofence/test?spaceSlug=${spaceSlug}`,
    testGeofence,
    {
      onSuccess: () => {
        toast.success(t('geofence_test_passed'))
      },
      onError: (error) => {
        toast.error(error.message || t('geofence_test_failed'))
      },
    }
  )
}

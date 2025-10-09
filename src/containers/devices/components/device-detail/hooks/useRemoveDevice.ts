import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useGetDevices } from '@/hooks/useDevices'

const removeDevice = async (url: string) => api.delete(url)

export const useRemoveDevice = (deviceId: string) => {
  const t = useTranslations('dashboard')
  const { mutate } = useGetDevices()
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(`/api/devices/${spaceSlug}/${deviceId}`, removeDevice, {
    onSuccess: () => {
      mutate()
      toast.success(t('device_removed_successfully'))
    },
    onError: () => {
      toast.error(t('failed_to_remove_device'))
    },
  })
}

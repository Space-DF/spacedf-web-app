import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import api from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const removeDevice = async (url: string) => api.delete(url)

export const useRemoveDevice = (deviceId?: string) => {
  const t = useTranslations('dashboard')
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!spaceSlug || !deviceId) throw new Error('Missing device')
      return removeDevice(`/api/devices/${spaceSlug}/${deviceId}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.devices.all })
      toast.success(t('device_removed_successfully'))
    },
    onError: () => {
      toast.error(t('failed_to_remove_device'))
    },
  })
}

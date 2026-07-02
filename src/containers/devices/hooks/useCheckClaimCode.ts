import api from '@/lib/api'
import { Device } from '@/stores/device-store'
import { useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

export const useCheckClaimCode = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const mutation = useMutation<Device, Error, string>({
    mutationFn: (arg: string) =>
      api.post(`/api/devices/${spaceSlug}/check-claim-code`, { code: arg }),
  })

  return {
    trigger: mutation.mutateAsync,
    isMutating: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  }
}

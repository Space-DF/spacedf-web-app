import api from '@/lib/api'
import { Device } from '@/stores/device-store'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const checkClaimCode = async (
  url: string,
  { arg }: { arg: string }
): Promise<Device> => {
  return api.post(url, { code: arg })
}
export const useCheckClaimCode = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    `/api/devices/${spaceSlug}/check-claim-code`,
    checkClaimCode
  )
}

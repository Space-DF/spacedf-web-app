import { Device } from '@/stores/device-store'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const checkClaimCode = async (
  url: string,
  { arg }: { arg: string }
): Promise<Device> => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ code: arg }),
  })
  const response = await res.json()
  if (res.ok) return response
  throw response
}
export const useCheckClaimCode = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    `/api/devices/${spaceSlug}/check-claim-code`,
    checkClaimCode
  )
}

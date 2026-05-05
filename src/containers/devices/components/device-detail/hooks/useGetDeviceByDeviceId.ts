import { DeviceDataOriginal } from '@/types/device'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export function useGetDeviceByDeviceId(deviceId?: string, enabled?: boolean) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    enabled && deviceId && spaceSlug
      ? `/api/devices/${spaceSlug}/${deviceId}`
      : null,
    fetcher<DeviceDataOriginal>
  )
}

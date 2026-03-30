import { DeviceDataOriginal } from '@/types/device'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useDeviceDetail = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    id && spaceSlug ? `/api/devices/${spaceSlug}?device_id=${id}` : null,
    fetcher<DeviceDataOriginal[]>
  )
}

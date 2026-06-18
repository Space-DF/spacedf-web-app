import { DeviceDataOriginal } from '@/types/device'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

export const useDeviceDetail = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  return useQuery<DeviceDataOriginal[]>({
    queryKey: ['devices', spaceSlug, 'detail', { deviceId: id }],
    queryFn: () =>
      fetcher<DeviceDataOriginal[]>(
        `/api/devices/${spaceSlug}?device_id=${id}`
      ),
    enabled: !!id && !!spaceSlug,
  })
}

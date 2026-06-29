import { DeviceDataOriginal } from '@/types/device'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useDeviceDetail = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  return useQuery<DeviceDataOriginal[]>({
    queryKey: [...queryKeys.devices.detail(), spaceSlug, { deviceId: id }],
    queryFn: () =>
      fetcher<DeviceDataOriginal[]>(
        `/api/devices/${spaceSlug}?device_id=${id}`
      ),
    enabled: !!id && !!spaceSlug,
  })
}

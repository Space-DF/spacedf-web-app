import { DeviceDataOriginal } from '@/types/device'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export function useGetDeviceByDeviceId(deviceId?: string, enabled?: boolean) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const query = useQuery<DeviceDataOriginal>({
    queryKey: [...queryKeys.devices.detail(), spaceSlug, deviceId],
    queryFn: () =>
      fetcher<DeviceDataOriginal>(`/api/devices/${spaceSlug}/${deviceId}`),
    enabled: !!enabled && !!deviceId && !!spaceSlug,
  })

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    mutate: query.refetch,
  }
}

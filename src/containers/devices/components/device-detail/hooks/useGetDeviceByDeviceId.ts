import { DeviceDataOriginal } from '@/types/device'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { useAuthenticated } from '@/hooks/useAuthenticated'

// Signed in -> scoped detail (identifier = device_id).
// Not signed in -> org-scoped public detail (identifier = device-space id).
export function useGetDeviceByDeviceId(deviceId?: string, enabled?: boolean) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const isAuthenticated = useAuthenticated()

  const url = isAuthenticated
    ? `/api/devices/${spaceSlug}/${deviceId}`
    : `/api/public/devices/${deviceId}`

  // Authed path needs a space; public path is org-scoped.
  const hasScope = isAuthenticated ? !!spaceSlug : true

  const query = useQuery<DeviceDataOriginal>({
    queryKey: [
      ...queryKeys.devices.detail(),
      spaceSlug,
      deviceId,
      isAuthenticated,
    ],
    queryFn: () => fetcher<DeviceDataOriginal>(url),
    enabled: !!enabled && !!deviceId && hasScope,
  })

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    mutate: query.refetch,
  }
}

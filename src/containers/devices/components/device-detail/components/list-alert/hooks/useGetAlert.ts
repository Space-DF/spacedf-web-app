import { Alert } from '@/types/alert'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useGetAlert = (deviceId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    spaceSlug && deviceId ? `/api/alert/${spaceSlug}/${deviceId}` : null,
    fetcher<Alert[]>
  )
}

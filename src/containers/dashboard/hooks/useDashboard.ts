import useSWR from 'swr'
import { Dashboard } from '@/types/dashboard'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'

export const useDashboard = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR<Dashboard[]>(`/api/dashboard/${spaceSlug}`, fetcher, {
    fallbackData: [],
  })
}

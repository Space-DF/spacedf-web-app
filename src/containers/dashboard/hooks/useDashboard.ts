import useSWR from 'swr'
import { Dashboard } from '@/types/dashboard'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/stores'
import api from '@/lib/api'

const getDashboard = (url: string): Promise<Dashboard[]> => api.get(url)

export const useDashboard = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = currentSpace?.slug_name || spaceSlug
  return useSWR<Dashboard[]>(
    spaceSlugName ? `/api/dashboard/${spaceSlugName}` : null,
    getDashboard
  )
}

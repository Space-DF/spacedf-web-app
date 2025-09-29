import useSWR from 'swr'
import { Dashboard } from '@/types/dashboard'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/stores'

export const useDashboard = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = currentSpace?.slug_name || spaceSlug
  return useSWR<Dashboard[]>(
    spaceSlugName ? `/api/dashboard/${spaceSlugName}` : null,
    fetcher,
    {
      fallbackData: [],
    }
  )
}

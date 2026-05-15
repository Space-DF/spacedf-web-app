import { useGlobalStore } from '@/stores'
import { useParams } from 'next/navigation'

export function useSpaceSlug() {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  return spaceSlug || currentSpace?.slug_name || ''
}

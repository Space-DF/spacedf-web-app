import { api } from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const updateWidgets = (url: string, { arg }: { arg: any }) => {
  return api.put(url, arg)
}

export const useUpdateWidgets = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  return useSWRMutation(
    `/api/dashboard/${spaceSlugName}/widgets`,
    updateWidgets
  )
}

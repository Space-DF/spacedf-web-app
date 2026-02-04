import api from '@/lib/api'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const fetcher = async (
  url: string,
  { arg }: { arg: { id: string; space_role: string } }
) => api.patch(url, arg)

export const useUpdateRoleMember = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(`/api/spaces/${spaceSlug}/members`, fetcher)
}

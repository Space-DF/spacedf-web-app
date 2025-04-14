import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const fetcher = async (
  url: string,
  { arg }: { arg: { id: string; space_role: string } }
) => {
  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(arg),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export const useUpdateRoleMember = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(`/api/spaces/${spaceSlug}/members`, fetcher)
}

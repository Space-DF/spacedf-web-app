import { Profile } from '@/types/profile'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const updateProfile = async (
  url: string,
  {
    arg,
  }: {
    arg: Omit<Profile, 'id'>
  }
) => {
  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(arg),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw errorData
  }
  const result = await response.json()
  return result
}

export const useUpdateProfile = () => {
  const { organization } = useParams<{ organization: string }>()
  return useSWRMutation(`/api/profile/${organization}`, updateProfile)
}

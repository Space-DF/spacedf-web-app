import { Profile } from '@/types/profile'
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
    throw response.json()
  }
  return response.json()
}

export const useUpdateProfile = () => useSWRMutation(`/api/me`, updateProfile)

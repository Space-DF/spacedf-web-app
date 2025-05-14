import api from '@/lib/api'
import { Profile } from '@/types/profile'
import useSWRMutation from 'swr/mutation'

const updateProfile = (
  url: string,
  {
    arg,
  }: {
    arg: Omit<Profile, 'id'>
  }
) => api.put(url, arg)

export const useUpdateProfile = () => useSWRMutation(`/api/me`, updateProfile)

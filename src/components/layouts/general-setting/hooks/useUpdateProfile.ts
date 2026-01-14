import api from '@/lib/api'
import { Profile } from '@/types/profile'
import useSWRMutation from 'swr/mutation'

const updateProfile = (
  url: string,
  {
    arg,
  }: {
    arg: Omit<Profile, 'id' | 'avatar'> & { avatar: File }
  }
) => {
  const formData = new FormData()
  formData.append('avatar', arg.avatar)
  formData.append('first_name', arg.first_name)
  formData.append('last_name', arg.last_name)
  formData.append('company_name', arg.company_name as string)
  formData.append('location', arg.location as string)
  formData.append('title', arg.title as string)
  return api.put(url, formData)
}

export const useUpdateProfile = () => useSWRMutation(`/api/me`, updateProfile)

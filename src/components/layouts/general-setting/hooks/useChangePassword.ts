import api from '@/lib/api'
import useSWRMutation from 'swr/mutation'

const changePassword = async (
  url: string,
  { arg }: { arg: { password?: string; new_password: string } }
) => api.put(url, arg)

export const useChangePassword = () => {
  return useSWRMutation('/api/auth/change-password', changePassword)
}

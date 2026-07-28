import api from '@/lib/api'
import { Profile } from '@/types/profile'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<
    any,
    Error,
    Omit<Profile, 'id' | 'avatar'> & {
      avatar: File
    }
  >({
    mutationFn: async (arg) => {
      const formData = new FormData()
      if (arg.avatar) {
        formData.append('avatar', arg.avatar)
      }
      formData.append('first_name', arg.first_name)
      formData.append('last_name', arg.last_name)
      return api.put('/api/me', formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.detail(),
      })
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

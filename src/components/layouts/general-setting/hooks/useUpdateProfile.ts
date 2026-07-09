import api from '@/lib/api'
import { Profile } from '@/types/profile'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<
    any,
    Error,
    Omit<Profile, 'id' | 'avatar' | 'company_name' | 'location' | 'title'> & {
      avatar: File
      company_name?: string | null
      location?: string | null
      title?: string | null
    }
  >({
    mutationFn: async (arg) => {
      const formData = new FormData()
      formData.append('avatar', arg.avatar)
      formData.append('first_name', arg.first_name)
      formData.append('last_name', arg.last_name)
      // The route forwards these verbatim; a missing value must not be persisted
      // as the string "undefined" or "null".
      formData.append('company_name', arg.company_name ?? '')
      formData.append('location', arg.location ?? '')
      formData.append('title', arg.title ?? '')
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

import api from '@/lib/api'
import { useMutation } from '@tanstack/react-query'

export const useChangePassword = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (arg: { password?: string; new_password: string }) =>
      api.put('/api/auth/change-password', arg),
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

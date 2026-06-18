import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { queryKeys } from '@/lib/query-keys'
import api from '@/lib/api'

const useJoinSpace = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<void, Error, string>({
    mutationFn: async (arg) => {
      return api.post('/api/spaces/join-space', { token: arg })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spaces.list() })
      router.replace('/invitation?status=success')
    },
    onError: () => {
      router.replace('/invitation?status=failed')
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

export default useJoinSpace

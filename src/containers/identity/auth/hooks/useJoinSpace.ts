import useSWRMutation from 'swr/mutation'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import api from '@/lib/api'

const fetcher = async (url: string, { arg }: { arg: string }) => {
  return api.post(url, { token: arg })
}

const useJoinSpace = () => {
  const router = useRouter()
  return useSWRMutation('/api/spaces/join-space', fetcher, {
    onSuccess: () => {
      mutate('/api/spaces')
      router.replace('/invitation?status=success')
    },
    onError: () => {
      router.replace('/invitation?status=failed')
    },
  })
}

export default useJoinSpace

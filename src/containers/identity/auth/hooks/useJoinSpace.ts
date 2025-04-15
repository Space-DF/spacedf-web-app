import useSWRMutation from 'swr/mutation'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'

const fetcher = async (url: string, { arg }: { arg: string }) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: arg }),
  })
  if (!res.ok) {
    throw res.json()
  }
  return res.json()
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

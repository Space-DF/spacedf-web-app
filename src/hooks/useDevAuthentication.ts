import { NEXT_PUBLIC_NODE_ENV } from '@/shared/env'
import { fetcher } from '@/utils'
import useSWR from 'swr'

const isDev = NEXT_PUBLIC_NODE_ENV === 'development'

const useCheckDevVerification = () => {
  return useSWR(
    isDev ? '/api/check-dev-verification' : null,
    fetcher<{ verified: boolean }>,
    {}
  )
}

export const useDevAuthentication = () => {
  const { data, isLoading } = useCheckDevVerification()
  if (!isDev) {
    return { verified: true }
  }
  return { verified: data?.verified, isLoading }
}

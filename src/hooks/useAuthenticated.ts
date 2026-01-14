import { useSession } from 'next-auth/react'

export const useAuthenticated = () => {
  const { status } = useSession()
  return status === 'authenticated'
}

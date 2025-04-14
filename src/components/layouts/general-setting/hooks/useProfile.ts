import { Profile } from '@/types/profile'
import useSWR from 'swr'

const getProfile = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw response.json()
  }
  return response.json()
}

export const useProfile = (isAuthenticated = true) =>
  useSWR<Profile>(isAuthenticated ? `/api/me` : null, getProfile)

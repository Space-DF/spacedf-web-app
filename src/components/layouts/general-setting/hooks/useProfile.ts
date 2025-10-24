import api from '@/lib/api'
import { Profile } from '@/types/profile'
import useSWR from 'swr'

const getProfile = (url: string) => {
  return api.get<Profile>(url)
}

export const useProfile = (isAuthenticated = true) =>
  useSWR(isAuthenticated ? `/api/me` : null, getProfile, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    dedupingInterval: 0,
  })

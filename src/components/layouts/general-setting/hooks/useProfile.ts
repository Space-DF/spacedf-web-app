import { Profile } from '@/types/profile'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const getProfile = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw response.json()
  }
  return response.json()
}

export const useProfile = () => {
  const { organization } = useParams<{ organization: string }>()
  return useSWR<Profile>(`/api/profile/${organization}`, getProfile)
}

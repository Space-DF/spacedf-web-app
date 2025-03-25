import { Profile } from '@/types/profile'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const getProfile = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json()
    throw errorData
  }
  const result = await response.json()
  return result.response_data
}

export const useProfile = () => {
  const { organization } = useParams<{ organization: string }>()
  return useSWR<Profile>(`/api/profile/${organization}`, getProfile)
}

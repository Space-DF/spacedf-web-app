import { PaginationResponse } from '@/types/global'
import { SpaceRole } from '@/types/space'
import useSWR from 'swr'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch space roles')
  }
  return response.json()
}

export const useSpaceRoles = () =>
  useSWR<PaginationResponse<SpaceRole>>('/api/spaces/roles', fetcher)

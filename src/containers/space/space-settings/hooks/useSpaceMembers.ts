import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Member } from '@/types/members'
import { PaginationResponse } from '@/types/global'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw response.json()
  }
  return response.json()
}

export const useSpaceMembers = (
  pageIndex: number = 0,
  limit: number = 10,
  search: string = ''
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR<PaginationResponse<Member>>(
    `/api/spaces/${spaceSlug}/members?pageIndex=${pageIndex}&limit=${limit}&search=${search}`,
    fetcher
  )
}

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Member } from '@/types/members'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'

export const useSpaceMembers = (
  pageIndex: number = 0,
  limit: number = 10,
  search: string = ''
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    `/api/spaces/${spaceSlug}/members?pageIndex=${pageIndex}&limit=${limit}&search=${search}`,
    fetcher<PaginationResponse<Member>>
  )
}

import { PaginationResponse } from '@/types/global'
import { SpaceRole } from '@/types/space'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useSpaceRoles = () => {
  const { spaceSlug } = useParams()
  return useSWR(
    `/api/spaces/${spaceSlug}/roles`,
    fetcher<PaginationResponse<SpaceRole>>
  )
}

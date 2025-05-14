import api from '@/lib/api'
import { PaginationResponse } from '@/types/global'
import { SpaceRole } from '@/types/space'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const fetcher = async (url: string) =>
  api.get<Promise<PaginationResponse<SpaceRole>>>(url)

export const useSpaceRoles = () => {
  const { spaceSlug } = useParams()
  return useSWR(`/api/spaces/${spaceSlug}/roles`, fetcher)
}

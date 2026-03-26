import { DEFAULT_PAGE_SIZE } from '@/constants'
import {
  Automation,
  AutomationParams,
  AutomationStatus,
} from '@/types/automation'
import { fetcher } from '@/utils'
import api from '@/lib/api'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { PaginationResponse } from '@/types/global'

const AUTOMATIONS_ENDPOINT = '/api/automations'

type UseAutomationsParams = {
  search?: string
  spaceSlug?: string
  limit?: number
  status?: AutomationStatus
}

const getKey = (
  pageIndex: number,
  previousPageData: PaginationResponse<Automation> | null,
  params: UseAutomationsParams
) => {
  if (previousPageData && !previousPageData.results.length) return null
  const offset = pageIndex * (params.limit ?? DEFAULT_PAGE_SIZE)
  const searchParams = new URLSearchParams({
    offset: String(offset),
    limit: String(params.limit ?? DEFAULT_PAGE_SIZE),
    search: params.search ?? '',
    spaceSlug: params.spaceSlug ?? '',
    status: params.status ?? '',
  })
  return `${AUTOMATIONS_ENDPOINT}?${searchParams.toString()}`
}

export const useAutomations = (params: UseAutomationsParams = {}) => {
  const { data, isLoading, mutate, ...rest } = useSWRInfinite(
    (pageIndex, previousPageData) =>
      getKey(pageIndex, previousPageData, params),
    fetcher<PaginationResponse<Automation>>
  )

  const automations: Automation[] = data
    ? data.flatMap((page) => page.results)
    : []
  const totalCount = data?.[0]?.count ?? 0
  const isReachingEnd = data
    ? (data[data.length - 1]?.results.length ?? 0) <
      (params.limit ?? DEFAULT_PAGE_SIZE)
    : false

  return { automations, totalCount, isLoading, isReachingEnd, mutate, ...rest }
}

export const useAutomation = (id: string, spaceSlug?: string) => {
  const key = id
    ? `${AUTOMATIONS_ENDPOINT}/${id}${spaceSlug ? `?spaceSlug=${spaceSlug}` : ''}`
    : null
  return useSWR<Automation>(key, fetcher<Automation>)
}

export const createAutomation = (
  params: AutomationParams,
  spaceSlug?: string
) => {
  const searchParams = spaceSlug ? `?spaceSlug=${spaceSlug}` : ''
  return api.post<Automation>(`${AUTOMATIONS_ENDPOINT}${searchParams}`, params)
}

export const updateAutomation = (
  id: string,
  params: Partial<AutomationParams>,
  spaceSlug?: string
) => {
  const searchParams = spaceSlug ? `?spaceSlug=${spaceSlug}` : ''
  return api.patch<Automation>(
    `${AUTOMATIONS_ENDPOINT}/${id}${searchParams}`,
    params
  )
}

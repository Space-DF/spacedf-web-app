import { Action } from '@/types/action'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import useSWR from 'swr'

export const useActions = () =>
  useSWR('/api/action', fetcher<PaginationResponse<Action>>)

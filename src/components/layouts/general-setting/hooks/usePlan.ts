import api from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import type { PlanCode, PlanResponse } from '@/types/plan'
import { useQuery } from '@tanstack/react-query'

/** Fetches a plan (feature list, support, pricing) from `GET /api/plans`. */
export const usePlan = (code: PlanCode, enabled = true) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.plans.detail(code),
    queryFn: () =>
      api.get<PlanResponse>(`/api/plans?plan=${encodeURIComponent(code)}`),
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  return {
    data,
    isLoading,
    mutate: refetch,
  }
}

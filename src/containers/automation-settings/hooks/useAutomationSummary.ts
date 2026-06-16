import { AutomationSummary } from '@/types/automation'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

export const useAutomationSummary = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const query = useQuery<AutomationSummary>({
    queryKey: ['automations', 'summary', spaceSlug],
    queryFn: () =>
      fetcher<AutomationSummary>(
        `/api/automations/summary?spaceSlug=${spaceSlug}`
      ),
    enabled: !!spaceSlug,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    mutate: query.refetch,
    error: query.error,
  }
}

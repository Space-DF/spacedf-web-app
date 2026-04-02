import { AutomationSummary } from '@/types/automation'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useAutomationSummary = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    spaceSlug ? `/api/automations/summary?spaceSlug=${spaceSlug}` : null,
    fetcher<AutomationSummary>
  )
}

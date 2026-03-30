import useSWRMutation from 'swr/mutation'
import { useParams } from 'next/navigation'
import { AutomationParams } from '@/types/automation'
import api from '@/lib/api'
import { Automation } from '@/types/automation'

const updateAutomation = (
  url: string,
  { arg }: { arg: AutomationParams }
): Promise<Automation> => {
  return api.patch(url, arg)
}

export const useUpdateAutomation = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    id ? `/api/automations/${id}?spaceSlug=${spaceSlug}` : null,
    updateAutomation
  )
}

import api from '@/lib/api'
import { Automation, AutomationParams } from '@/types/automation'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const createAutomation = (url: string, { arg }: { arg: AutomationParams }) => {
  return api.post<Automation>(url, arg)
}

export const useCreateAutomation = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const searchParams = spaceSlug ? `?spaceSlug=${spaceSlug}` : ''
  return useSWRMutation(`/api/automations${searchParams}`, createAutomation, {})
}

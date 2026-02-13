import api from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useParams } from 'next/navigation'
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation'

export function createWidget(
  url: string,
  { arg }: { arg: { configuration: any } }
) {
  return api.post(url, arg)
}

export const useCreateWidget = (
  options: SWRMutationConfiguration<any, any, string> = {}
) => {
  const dashboardId = useDashboardStore((state) => state.dashboardId)
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  const { trigger, isMutating } = useSWRMutation(
    `/api/dashboard/${spaceSlugName}/widgets/${dashboardId}`,
    createWidget,
    options
  )

  return { createWidget: trigger, isMutating }
}

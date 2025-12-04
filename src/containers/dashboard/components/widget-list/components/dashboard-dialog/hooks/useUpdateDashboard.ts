import api from '@/lib/api'
import { Dashboard } from '@/types/dashboard'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

const updateDashboard = (
  url: string,
  { arg }: { arg: { name: string; id: string } }
): Promise<Dashboard> => {
  return api.patch(`${url}/${arg.id}`, arg)
}
export const useUpdateDashboard = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('dashboard')
  return useSWRMutation(`/api/dashboard/${spaceSlug}`, updateDashboard, {
    optimisticData: (currentData?: Dashboard[]): Dashboard[] => {
      return currentData as Dashboard[]
    },
    populateCache: (result: Dashboard, currentData?: Dashboard[]) => {
      return (
        currentData?.map((dashboard) =>
          dashboard.id === result.id ? result : dashboard
        ) || [result]
      )
    },
    onSuccess: () => {
      toast.success(t('dashboard_updated_successfully'))
    },
    onError: (error) => {
      toast.error(error.message || t('dashboard_update_failed'))
    },
  })
}

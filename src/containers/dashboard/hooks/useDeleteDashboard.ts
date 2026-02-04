import api from '@/lib/api'
import { Dashboard } from '@/types/dashboard'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

const deleteDashboard = async (url: string) => {
  return api.delete(url)
}

export const useDeleteDashboard = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    id ? `/api/dashboard/${spaceSlug}/${id}` : null,
    deleteDashboard,
    {
      optimisticData: (currentData?: Dashboard[]): Dashboard[] => {
        return currentData as Dashboard[]
      },
      populateCache: (_, currentData) => {
        return (currentData || []).filter((dashboard) => dashboard.id !== id)
      },
      onSuccess: () => {
        toast.success('Dashboard deleted successfully')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )
}

import api from '@/lib/api'
import { Dashboard } from '@/types/dashboard'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

const createDashboard = (
  url: string,
  { arg }: { arg: { name: string } }
): Promise<Dashboard> => {
  return api.post(url, {
    name: arg.name,
  })
}

export const useCreateDashboard = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(`/api/dashboard/${spaceSlug}`, createDashboard, {
    optimisticData: (currentData?: Dashboard[]): Dashboard[] => {
      return currentData as Dashboard[]
    },
    populateCache: (result, currentData) => {
      return [...(currentData || []), result as Dashboard]
    },
    onSuccess: () => {
      toast.success('Dashboard created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    revalidate: false,
  })
}

import api from '@/lib/api'
import { Dashboard } from '@/types/dashboard'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useCreateDashboard = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<
    Dashboard,
    Error,
    { name: string }
  >({
    mutationFn: async (arg) => {
      return api.post(`/api/dashboard/${spaceSlug}`, {
        name: arg.name,
      })
    },
    onSuccess: () => {
      toast.success('Dashboard created successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.all })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

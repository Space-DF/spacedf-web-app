import api from '@/lib/api'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useDeleteDashboard = (id?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!id) return
      return api.delete(`/api/dashboard/${spaceSlug}/${id}`)
    },
    onSuccess: () => {
      toast.success('Dashboard deleted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.all })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

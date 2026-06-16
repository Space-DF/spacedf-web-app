import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

export const useRemoveSpaceMember = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()
  const t = useTranslations('space')

  const { mutateAsync, isPending } = useMutation<any, Error, string>({
    mutationFn: async (arg: string) => {
      return api.delete(`/api/spaces/${spaceSlug}/members`, {
        body: JSON.stringify({ id: arg }),
      })
    },
    onSuccess: () => {
      toast.success(t('member_removed_successfully'))
      queryClient.invalidateQueries({
        queryKey: queryKeys.spaces.detail(spaceSlug),
      })
    },
    onError: () => {
      toast.error(t('failed_to_remove_member'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

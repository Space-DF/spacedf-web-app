import { InviteMember } from '@/types/members'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

export const useInviteSpaceMembers = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()
  const t = useTranslations('space')

  const { mutateAsync, isPending } = useMutation<any, Error, InviteMember[]>({
    mutationFn: async (arg: InviteMember[]) => {
      return api.post(`/api/spaces/${spaceSlug}/members`, arg)
    },
    onSuccess: () => {
      toast.success(t('invitation_sent_successfully'))
      queryClient.invalidateQueries({
        queryKey: queryKeys.spaces.detail(spaceSlug),
      })
    },
    onError: () => {
      toast.error(t('failed_to_send_invitation'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

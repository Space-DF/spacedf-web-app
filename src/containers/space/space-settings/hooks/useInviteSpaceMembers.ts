import { InviteMember } from '@/types/members'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'
const fetcher = async (url: string, { arg }: { arg: InviteMember[] }) =>
  api.post(url, arg)

export const useInviteSpaceMembers = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('space')
  return useSWRMutation(`/api/spaces/${spaceSlug}/members`, fetcher, {
    onSuccess: () => {
      toast.success(t('invitation_sent_successfully'))
    },
    onError: () => {
      toast.error(t('failed_to_send_invitation'))
    },
  })
}

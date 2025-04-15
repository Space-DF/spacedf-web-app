import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

const fetcher = async (url: string, { arg }: { arg: string }) => {
  const response = await fetch(url, {
    method: 'DELETE',
    body: JSON.stringify({ id: arg }),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export const useRemoveSpaceMember = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const t = useTranslations('space')
  return useSWRMutation(`/api/spaces/${spaceSlug}/members`, fetcher, {
    onSuccess: () => {
      toast.success(t('member_removed_successfully'))
    },
    onError: () => {
      toast.error(t('failed_to_remove_member'))
    },
  })
}

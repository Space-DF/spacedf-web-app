import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import useSWRMutation from 'swr/mutation'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

const deleteAccount = async (url: string) => {
  return api.delete(url)
}

export const useDeleteAccount = () => {
  const t = useTranslations('generalSettings')
  const router = useRouter()
  return useSWRMutation(`/api/me`, deleteAccount, {
    onSuccess: () => {
      toast.success(t('delete_account_success'))
      signOut({ redirect: false })
      router.replace('/')
    },
    onError: () => {
      toast.error(t('delete_account_error'))
    },
  })
}

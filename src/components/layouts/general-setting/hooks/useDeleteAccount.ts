import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { LOCAL_STORAGE_KEYS } from '@/constants'

export const useDeleteAccount = () => {
  const t = useTranslations('generalSettings')
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => api.delete('/api/me'),
    onSuccess: async () => {
      toast.success(t('delete_account_success'))
      await signOut({ redirect: false })
      localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTIF_PERMISSION_KEY)
      router.replace('/')
      queryClient.clear()
    },
    onError: () => {
      toast.error(t('delete_account_error'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

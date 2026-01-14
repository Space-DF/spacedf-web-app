import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useAuthForm } from './stores/useAuthForm'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useIdentityStore } from '@/stores/identity-store'
import { useAuthenticated } from '@/hooks/useAuthenticated'

export const ResetPasswordSuccessful = () => {
  const t = useTranslations('signUp')
  const setFormType = useAuthForm((state) => state.setFormType)

  const setOpenDrawer = useIdentityStore((state) => state.setOpenDrawerIdentity)

  const isAuthenticated = useAuthenticated()
  const router = useRouter()

  const handleLogin = useCallback(() => {
    if (!isAuthenticated) {
      setFormType('signIn')
      return router.replace('/')
    }
    setOpenDrawer(false)
    router.replace('/')
  }, [isAuthenticated, setFormType, router, setOpenDrawer])

  return (
    <div className="space-y-6 flex flex-col items-center justify-center  w-full animate-opacity-display-effect self-start">
      <Image
        src={'/images/shield.svg'}
        alt="shield"
        className="size-24"
        width={96}
        height={96}
      />

      <div className="space-y-2">
        <p className="text-3xl font-semibold">{t('forgot_your_password')}</p>
        <p className="text-brand-component-text-gray text-sm">
          {t('awesome_you_have_successfully_updated_your_password')}
        </p>
      </div>
      <Button
        className="w-56 h-12 rounded-lg border-4 border-brand-heading bg-brand-fill-outermost shadow-sm"
        onClick={handleLogin}
      >
        {t('login_now')}
      </Button>
    </div>
  )
}

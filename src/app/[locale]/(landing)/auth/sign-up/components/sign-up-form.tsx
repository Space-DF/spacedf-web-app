import React from 'react'
import { useTranslations } from 'next-intl'
import AuthenticateWithGoogle from '@/containers/identity/auth/authenticate-with-google'
import AuthenticateWithApple from '@/containers/identity/auth/authenticate-with-apple'
import { Separator } from '@/components/ui/separator'
import SignUpForm from '@/components/ui/sign-up'

export default function SignUp() {
  const t = useTranslations('signUp')
  return (
    <div className="mx-auto my-10 flex size-full flex-col items-center justify-center px-5 md:max-w-xl">
      <p className="my-6 text-3xl font-semibold">{t('sign_up_to_SpaceDF')}</p>
      <AuthenticateWithGoogle />
      <AuthenticateWithApple />
      <Separator className="my-4 bg-brand-component-stroke-dark-soft dark:bg-brand-component-stroke-dark-soft" />
      <SignUpForm />
    </div>
  )
}

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { SpaceDFLogoFull } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import AuthenticateWithApple from './authenticate-with-apple'
import AuthenticateWithGoogle from './authenticate-with-google'
// import QrCode from './qr-code'
import SignInForm from './sign-in-form'
import SignUpForm from './sign-up-form'

export type AuthenticationMethod = 'signIn' | 'signUp'
export type AuthData = {
  method: AuthenticationMethod
  data?: Record<string, string>
}

const Authentication = () => {
  const [authData, setAuthenticateMethod] = useState<AuthData>({
    method: 'signIn',
    data: {},
  })
  const t = useTranslations('signUp')

  const isSignUp = authData.method === 'signUp'

  return (
    <div className="my-10 flex size-full flex-col items-center justify-center md:max-w-md">
      <SpaceDFLogoFull />
      <p className="my-6 text-3xl font-semibold">
        {isSignUp ? t('sign_up') : t('sign_in')}
      </p>

      <AuthenticateWithGoogle />
      <AuthenticateWithApple />

      <Separator className="my-6" />

      {isSignUp ? (
        <SignUpForm setAuthMethod={setAuthenticateMethod} />
      ) : (
        <SignInForm
          setAuthMethod={setAuthenticateMethod}
          initialData={authData.data}
        />
      )}

      {/*<div className="mt-6">*/}
      {/*  <QrCode />*/}
      {/*</div>*/}
    </div>
  )
}

export default Authentication

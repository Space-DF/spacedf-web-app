import { SpaceDFLogoFull } from '@/components/icons'
import React, { useState } from 'react'
import AuthenticateWithGoogle from './authenticate-with-google'
import { Separator } from '@/components/ui/separator'
import SignUpForm from './sign-up-form'
import SignInForm from './sign-in-form'
import QrCode from './qr-code'

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

  const isSignUp = authData.method === 'signUp'

  return (
    <div className="my-10 flex h-full w-full flex-col items-center justify-center md:max-w-md">
      <SpaceDFLogoFull />
      <p className="my-6 text-3xl font-semibold">
        {isSignUp ? 'Sign up' : 'Sign in'}
      </p>

      <AuthenticateWithGoogle isSignUp={isSignUp} />

      <Separator className="my-6" />

      {isSignUp ? (
        <SignUpForm setAuthMethod={setAuthenticateMethod} />
      ) : (
        <SignInForm
          setAuthMethod={setAuthenticateMethod}
          initialData={authData.data}
        />
      )}

      <div className="mt-6">
        <QrCode />
      </div>
    </div>
  )
}

export default Authentication

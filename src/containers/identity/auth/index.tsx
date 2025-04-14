import { useTranslations } from 'next-intl'
import React from 'react'
import { SpaceDFLogoFull } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import AuthenticateWithApple from './authenticate-with-apple'
import AuthenticateWithGoogle from './authenticate-with-google'
// import QrCode from './qr-code'
import SignInForm from './sign-in-form'
import SignUpForm from './sign-up-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { singUpSchema } from './validator/signUpSchema'
import { z } from 'zod'
import OTPForm from './otp-form'
import { useAuthForm } from './stores/useAuthForm'
export type AuthenticationMethod = 'signIn' | 'signUp'

export type SignUpFormCredentials = z.infer<typeof singUpSchema>

export type AuthData = {
  method: AuthenticationMethod
  data?: Record<string, string>
}

const Authentication = () => {
  const { formType } = useAuthForm((state) => ({
    formType: state.formType,
  }))
  const t = useTranslations('signUp')

  const signUpForm = useForm<SignUpFormCredentials>({
    resolver: zodResolver(singUpSchema),
  })

  const isOtp = formType === 'otp'
  const isSignUp = formType === 'signup'

  return (
    <div className="my-10 flex size-full flex-col items-center justify-center md:max-w-md">
      <SpaceDFLogoFull />
      <p className="my-6 text-3xl font-semibold">
        {isSignUp || isOtp ? t('sign_up') : t('sign_in')}
      </p>
      <FormProvider {...signUpForm}>
        {isOtp ? (
          <OTPForm />
        ) : (
          <>
            <AuthenticateWithGoogle />
            <AuthenticateWithApple />
            <Separator className="my-6" />
            {isSignUp ? <SignUpForm /> : <SignInForm />}
            {/*<div className="mt-6">*/}
            {/*  <QrCode />*/}
            {/*</div>*/}
          </>
        )}
      </FormProvider>
    </div>
  )
}

export default Authentication

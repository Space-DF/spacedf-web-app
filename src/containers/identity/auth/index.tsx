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
import { useShallow } from 'zustand/react/shallow'
import { ForgotPasswordForm } from './forgot-password-form'
import { CreateNewPasswordForm } from './create-new-password-form'
import { ResetPasswordSuccessful } from './reset-password-successful'

export type SignUpFormCredentials = z.infer<typeof singUpSchema>

const SignForm = () => {
  const { formType } = useAuthForm(
    useShallow((state) => ({
      formType: state.formType,
    }))
  )
  const signUpForm = useForm<SignUpFormCredentials>({
    resolver: zodResolver(singUpSchema),
  })
  const isSignUp = formType === 'signUp'
  const isOtp = formType === 'otp'

  const isSignIn = formType !== 'signUp' && formType !== 'otp'
  const t = useTranslations('signUp')
  return (
    <>
      <p className="my-6 text-3xl font-semibold">
        {!isSignIn ? t('sign_up') : t('sign_in')}
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
    </>
  )
}

const AuthForm = () => {
  const { formType } = useAuthForm((state) => ({
    formType: state.formType,
  }))

  switch (formType) {
    case 'signUp':
    case 'otp':
    case 'signIn':
      return <SignForm />
    case 'forgotPassword':
      return <ForgotPasswordForm />
    case 'createNewPassword':
      return <CreateNewPasswordForm />
    default:
      return <></>
  }
}

const Authentication = () => {
  const { formType } = useAuthForm((state) => ({
    formType: state.formType,
  }))
  return (
    <div className="my-10 flex size-full flex-col items-center justify-center md:max-w-md">
      {formType === 'resetPasswordSuccessful' ? (
        <ResetPasswordSuccessful />
      ) : (
        <>
          <SpaceDFLogoFull />
          <AuthForm />
        </>
      )}
    </div>
  )
}

export default Authentication

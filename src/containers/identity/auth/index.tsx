import { useTranslations } from 'next-intl'
import React from 'react'
import { SpaceDFLogoFull } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import AuthenticateWithApple from './authenticate-with-apple'
import AuthenticateWithGoogle from './authenticate-with-google'
import SignInForm from './sign-in-form'
import SignUpForm from './sign-up-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { signUpSchema } from './validator/signUpSchema'
import { z } from 'zod'
import OTPForm from './otp-form'
import { useAuthForm } from './stores/useAuthForm'
import { ForgotPasswordForm } from './forgot-password-form'
import { CreateNewPasswordForm } from './create-new-password-form'
import { ResetPasswordSuccessful } from './reset-password-successful'
import { useCustomPage } from './hooks/useCustomPage'
import type { CustomPageType } from '@/types/organization'
import { cn } from '@/lib/utils'

export type SignUpFormCredentials = z.infer<typeof signUpSchema>

const FORM_TYPE_TO_PAGE_TYPE: Record<string, CustomPageType> = {
  signIn: 'sign_in',
  signUp: 'sign_up',
  forgotPassword: 'forget_password',
  createNewPassword: 'change_password',
}

const SignForm = () => {
  const formType = useAuthForm((state) => state.formType)
  const signUpForm = useForm<SignUpFormCredentials>({
    resolver: zodResolver(signUpSchema),
  })
  const isSignUp = formType === 'signUp'
  const isOtp = formType === 'otp'

  const isSignIn = formType !== 'signUp' && formType !== 'otp'
  const t = useTranslations('signUp')
  const customPage = useCustomPage(isSignIn ? 'sign_in' : 'sign_up')
  return (
    <>
      <div className="my-6 space-y-2 text-center">
        <p className="text-3xl font-semibold">
          {customPage?.title || (isSignIn ? t('sign_in') : t('sign_up'))}
        </p>
        {customPage?.subtitle && (
          <p className="text-sm text-muted-foreground">{customPage.subtitle}</p>
        )}
      </div>
      <FormProvider {...signUpForm}>
        {isOtp ? (
          <OTPForm />
        ) : (
          <>
            <AuthenticateWithGoogle />
            <AuthenticateWithApple />
            <Separator className="my-6" />
            {isSignUp ? <SignUpForm /> : <SignInForm />}
          </>
        )}
      </FormProvider>
    </>
  )
}

const AuthForm = () => {
  const formType = useAuthForm((state) => state.formType)

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
  const formType = useAuthForm((state) => state.formType)
  const customPage = useCustomPage(FORM_TYPE_TO_PAGE_TYPE[formType])
  const showLogo = customPage?.show_logo ?? true
  const backgroundImage = customPage?.url_background_image
  return (
    <div
      className="flex size-full items-center justify-center bg-cover bg-center bg-no-repeat"
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : undefined
      }
    >
      <div
        className={cn(
          'my-10 flex size-full flex-col items-center justify-center md:max-w-md',
          backgroundImage &&
            'size-auto w-full max-w-md rounded-2xl bg-background px-6 py-8 shadow-xl'
        )}
      >
        {formType === 'resetPasswordSuccessful' ? (
          <ResetPasswordSuccessful />
        ) : (
          <>
            {showLogo && <SpaceDFLogoFull />}
            <AuthForm />
          </>
        )}
      </div>
    </div>
  )
}

export default Authentication

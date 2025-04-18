import { CircleUserRound, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { InputWithIcon } from '@/components/ui/input'
import {
  TypographyPrimary,
  TypographySecondary,
} from '@/components/ui/typography'
import { SignUpFormCredentials } from '.'
import { useShallow } from 'zustand/react/shallow'
import useSendOTP from './hooks/useSendOTP'
import { useAuthForm } from './stores/useAuthForm'
import { useDecodedToken } from './hooks/useDecodedToken'
import { useSearchParams } from 'next/navigation'

const SignUpForm = () => {
  const t = useTranslations('signUp')
  const form = useFormContext<SignUpFormCredentials>()
  const { trigger: triggerSendOtp, isMutating: isMutatingSendOtp } =
    useSendOTP()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { data: decodedToken } = useDecodedToken(token)

  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false)

  const { setFormType } = useAuthForm(
    useShallow((state) => ({
      setFormType: state.setFormType,
    }))
  )

  const onSendOtp = async (value: SignUpFormCredentials) => {
    await triggerSendOtp(value.email)
    setFormType('otp')
  }

  useEffect(() => {
    if (decodedToken) {
      form.setValue('email', decodedToken.email_receiver)
    }
  }, [decodedToken])

  return (
    <div className="w-full animate-opacity-display-effect self-start">
      <TypographyPrimary className="font-medium">
        {t('or_continue_with_email_address')}
      </TypographyPrimary>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSendOtp)} className="mt-5">
          <div className="space-y-3">
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('first_name')}</FormLabel>
                    <FormControl>
                      <InputWithIcon
                        prefixCpn={<CircleUserRound size={16} />}
                        {...field}
                        placeholder={t('first_name')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('last_name')}</FormLabel>
                    <FormControl>
                      <InputWithIcon
                        prefixCpn={<CircleUserRound size={16} />}
                        {...field}
                        placeholder={t('last_name')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={<Mail size={16} />}
                      {...field}
                      placeholder="Email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type={isShowPassword ? 'text' : 'password'}
                      prefixCpn={<LockKeyhole size={16} />}
                      suffixCpn={
                        <span
                          className="cursor-pointer"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                        >
                          {isShowPassword ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </span>
                      }
                      {...field}
                      placeholder={t('password')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirm_password')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type={isShowConfirmPassword ? 'text' : 'password'}
                      prefixCpn={<LockKeyhole size={16} />}
                      suffixCpn={
                        <span
                          className="cursor-pointer"
                          onClick={() =>
                            setIsShowConfirmPassword(!isShowConfirmPassword)
                          }
                        >
                          {isShowConfirmPassword ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </span>
                      }
                      {...field}
                      placeholder={t('password')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="mb-2 mt-5 h-11 w-full"
            loading={isMutatingSendOtp}
          >
            {t('sign_up')}
          </Button>
        </form>
      </Form>
      <div className="flex items-center justify-center gap-2 text-center text-xs">
        <TypographySecondary className="font-semibold">
          {t('already_have_an_account')}
        </TypographySecondary>
        <span
          className="cursor-pointer font-semibold hover:underline"
          onClick={() => {
            setFormType('login')
          }}
        >
          {t('sign_in')}
        </span>
      </div>
    </div>
  )
}

export default SignUpForm

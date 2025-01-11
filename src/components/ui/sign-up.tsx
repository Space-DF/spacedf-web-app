'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleUserRound, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { singInSchema } from '@/containers/identity/auth/sign-up-form'
import { Link } from '@/i18n/routing'
import { useIdentityStore } from '@/stores/identity-store'
import { ApiResponse } from '@/types/global'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

export interface SignUpResponse {
  status: number
  response_data: {
    message: string
    user: User
    refresh: string
    access: string
  }
}

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
}

const SignUpForm = () => {
  const t = useTranslations('signUp')
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
    defaultValues: {
      last_name: '',
      first_name: '',
      email: '',
      password: '',
      confirm_password: '',
      // last_name: 'sgt',
      // first_name: 'sgt',
      // email: 'sgt+root5@yopmail.com',
      // password: '@Aa123123',
      // confirm_password: '@Aa123123',
    },
  })

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false)

  const { setRootAuth } = useIdentityStore(useShallow((state) => state))

  const onSubmit = async (values: z.infer<typeof singInSchema>) => {
    setIsAuthenticating(true)
    const fetchPromise = fetch('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(values),
    }).then(async (response) => {
      const result: ApiResponse<SignUpResponse> = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong')
      }
      return result
    })

    setRootAuth(['sign-up', values.email])

    toast.promise(fetchPromise, {
      loading: 'Signing up...',
      success: ({ data }) => {
        signIn('credentials', {
          redirect: false,
          sigUpSuccessfully: true,
          dataUser: JSON.stringify({
            ...data?.response_data.user,
            accessToken: data?.response_data?.access,
            refreshToken: data?.response_data?.refresh,
          }),
        })
        setTimeout(() => {
          console.log(window.location.origin)
          const [protocol, host] = window.location.origin.split('//')

          const orgDomain = 'develop.' + host

          const orgFullURL = [protocol, orgDomain].join('//')

          window.location.href = orgFullURL
        }, 500)
        return data?.response_data?.message || 'Sign up successful!'
      },
      error: () => {
        return t(
          'this_email_is_already_registered_please_use_a_different_email_or_log_in'
        )
      },
      finally() {
        setIsAuthenticating(false)
      },
    })
  }

  return (
    <div className="w-full animate-opacity-display-effect self-start">
      <TypographyPrimary className="text-sm font-medium">
        {t('or_continue_with_email_address')}
      </TypographyPrimary>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-5">
          <div className="space-y-4">
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
            className="mb-2 h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-semibold text-white shadow-sm dark:border-brand-component-stroke-light"
            loading={isAuthenticating}
            disabled={isAuthenticating}
          >
            {t('sign_up')}
          </Button>
        </form>
      </Form>
      <div className="mt-3.5 flex items-center justify-center gap-2 text-center text-sm">
        <TypographySecondary className="font-semibold text-brand-component-text-gray">
          {t('already_have_an_account')}
        </TypographySecondary>
        <Link
          className="text-gradiant cursor-pointer font-semibold hover:underline"
          href="/auth/sign-in"
        >
          {t('sign_in')}
        </Link>
      </div>
    </div>
  )
}

export default SignUpForm

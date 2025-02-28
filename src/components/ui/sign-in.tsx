'use client'

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
import { Link, useRouter } from '@/i18n/routing'
import { ApiResponse } from '@/types/global'
import { passwordSchema } from '@/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface SignInResponse {
  response_data: {
    message: string
    refresh: string
    access: string
  }
}

const singInSchema = z.object({
  email: z
    .string({ message: 'Email cannot be empty' })
    .email({ message: 'Please enter a valid email address' })
    .min(1, { message: 'Email is required' })
    .max(50, { message: 'Email must be less than or equal to 50 characters' }),

  password: passwordSchema,
  remember_me: z.boolean().optional(),
})

const SignInForm = () => {
  const t = useTranslations('signUp')
  const router = useRouter()
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
    defaultValues: {
      email: '',
      password: '',
      // email: 'root01@yopmail.com',
      // password: '@Aa123123',
    },
  })
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isAuthenticating, startAuthentication] = useTransition()

  const onSubmit = (values: z.infer<typeof singInSchema>) => {
    startAuthentication(async () => {
      const fetchPromise = fetch('/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify(values),
      }).then(async (response) => {
        const result: ApiResponse<SignInResponse> = await response.json()
        if (!response.ok) {
          throw new Error(result.message || 'Something went wrong')
        }
        return result
      })

      toast.promise(fetchPromise, {
        loading: 'Signing in...',
        success: (res) => {
          const { data } = res
          signIn('credentials', {
            redirect: false,
            sigUpSuccessfully: true,
            dataUser: JSON.stringify({
              accessToken: data?.response_data?.access,
              refreshToken: data?.response_data?.refresh,
            }),
          })
          setTimeout(() => {
            // const [protocol, host] = window.location.origin.split('//')
            // const orgDomain = 'develop.' + host
            // const orgFullURL = [protocol, orgDomain].join('//')
            // window.location.href = orgFullURL

            router.replace('/organizations')
          }, 500)
          return data?.response_data?.message || 'Sign up successful!'
        },
        error: (err) => {
          return (
            err.message ||
            t(
              'this_email_is_already_registered_please_use_a_different_email_or_log_in'
            )
          )
        },
      })
    })
  }
  return (
    <div className="w-full animate-opacity-display-effect self-start">
      {/* <p className=" font-semibold">Or continue with email address</p> */}
      <TypographyPrimary className="text-sm font-medium">
        {t('or_continue_with_email_address')}
      </TypographyPrimary>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">Email</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={<Mail size={16} />}
                      {...field}
                      placeholder="Email"
                      className=""
                    />
                  </FormControl>

                  <FormMessage className="" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">{t('password')}</FormLabel>
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
          </div>
          <div className="mb-5 mt-4 flex items-center justify-end">
            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name="remember_me"*/}
            {/*  render={({ field }) => (*/}
            {/*    <FormItem>*/}
            {/*      <FormControl>*/}
            {/*        <div className="flex items-center space-x-2">*/}
            {/*          <Checkbox id="remember_me" />*/}

            {/*          <label*/}
            {/*            htmlFor="remember_me"*/}
            {/*            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"*/}
            {/*          >*/}
            {/*            Remember me*/}
            {/*          </label>*/}
            {/*        </div>*/}
            {/*      </FormControl>*/}
            {/*    </FormItem>*/}
            {/*  )}*/}
            {/*/>*/}
            <p className="cursor-pointer text-xs font-semibold hover:underline">
              {t('forgot_password')}
            </p>
          </div>
          <Button
            type="submit"
            className="mb-2 h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-semibold text-white shadow-sm dark:border-brand-component-stroke-light"
            loading={isAuthenticating}
          >
            {t('sign_in')}
          </Button>
        </form>
      </Form>
      <div className="mt-3.5 flex items-center justify-center gap-2 text-center text-sm">
        <TypographySecondary className="font-semibold text-brand-component-text-gray">
          {t('already_have_an_account')}
        </TypographySecondary>
        <Link
          className="text-gradiant cursor-pointer font-semibold hover:underline"
          href="/auth/sign-up"
        >
          {t('sign_up')}
        </Link>
      </div>
    </div>
  )
}

export default SignInForm

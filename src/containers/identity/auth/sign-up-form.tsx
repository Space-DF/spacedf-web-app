import { zodResolver } from '@hookform/resolvers/zod'
import { CircleUserRound, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { ApiResponse } from '@/types/global'
import { AuthData } from '.'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'

export const passwordSchema = z
  .string()
  .min(1, { message: 'Password cannot be empty' })
  .max(150, {
    message: 'Password must be less than or equal to 150 characters',
  })
  .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/, {
    message:
      'The password must has least 8 character, including uppercase letters, numbers, and special characters.',
  })

export const singInSchema = z
  .object({
    first_name: z
      .string()
      .min(1, { message: 'First Name cannot be empty' })
      .max(50, {
        message: 'First Name must not exceed 50 characters',
      })
      .regex(/^[A-Za-z\s]*$/, {
        message: 'Only alphabetic characters and spaces are accepted',
      }),
    last_name: z
      .string()
      .min(1, { message: 'Last Name cannot be empty ' })
      .max(50, {
        message: 'Last Name must not exceed 50 characters',
      })
      .regex(/^[A-Za-z\s]*$/, {
        message: 'Only alphabetic characters and spaces are accepted',
      }),
    email: z
      .string()
      .email({ message: 'Invalid Email' })
      .min(1, { message: 'Email cannot be empty' })
      .refine((value) => value.split('@')[0].length <= 64, {
        message: 'Invalid Email', // Local part max length
      })
      .refine((value) => value.split('@')[1]?.length <= 255, {
        message: 'Invalid Email', // Domain part max length
      }),
    password: passwordSchema,
    confirm_password: z
      .string()
      .min(1, { message: 'Confirm password cannot be empty ' }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Confirm password must match the password entered above.',
    path: ['confirm_password'],
  })

interface SignUpResponse {
  message: string
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  refresh: string
  access: string
}

const SignUpForm = ({
  setAuthMethod,
}: {
  setAuthMethod: (data: AuthData) => void
}) => {
  const t = useTranslations('signUp')
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
  })

  const { isDirty, isValid } = form.formState
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false)

  const { setOpenDrawer } = useIdentityStore(
    useShallow((state) => ({
      openDrawer: state.openDrawerIdentity,
      setOpenDrawer: state.setOpenDrawerIdentity,
    })),
  )

  const onSubmit = async (value: z.infer<typeof singInSchema>) => {
    setIsAuthenticating(true)

    const fetchPromise = fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(value),
    }).then(async (response) => {
      const result: ApiResponse<SignUpResponse> = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong')
      }
      return result
    })

    toast.promise(fetchPromise, {
      loading: 'Signing up...',
      success: (res) => {
        signIn('credentials', {
          redirect: false,
          sigUpSuccessfully: true,
          dataUser: JSON.stringify({
            ...res?.data?.user,
            accessToken: res?.data?.access,
            refreshToken: res?.data?.refresh,
          }),
        })

        setOpenDrawer(false)

        return res?.data?.message || 'Sign up successful!'
      },
      error: () => {
        return t(
          'this_email_is_already_registered_please_use_a_different_email_or_log_in',
        )
      },
      finally() {
        setIsAuthenticating(false)
      },
    })
  }

  return (
    <div className="w-full animate-opacity-display-effect self-start">
      <TypographyPrimary className="font-medium">
        {t('or_continue_with_email_address')}
      </TypographyPrimary>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
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
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
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
                      type={isShowPassword ? 'text' : 'password'}
                      prefixCpn={<LockKeyhole size={16} />}
                      suffixCpn={
                        <span
                          className="cursor-pointer"
                          onClick={() =>
                            setIsShowConfirmPassword(!isShowConfirmPassword)
                          }
                        >
                          {isShowConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
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
            loading={isAuthenticating}
            disabled={!isDirty || !isValid}
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
            setAuthMethod({ method: 'signIn' })
          }}
        >
          {t('sign_in')}
        </span>
      </div>
    </div>
  )
}

export default SignUpForm

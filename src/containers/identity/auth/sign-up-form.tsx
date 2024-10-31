import { zodResolver } from '@hookform/resolvers/zod'
import { CircleUserRound, LockKeyhole, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'

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
import { TypographyPrimary, TypographySecondary } from '@/components/ui/typography'
import { AuthData } from '.'
import { ApiResponse } from '@/types/global'

export const passwordSchema = z
  .string()
  .min(3, { message: 'Password must have at least 3 characters' })
  .max(150, { message: 'Password must be less than or equal to 150 characters' })
  .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })

export const singInSchema = z
  .object({
    first_name: z
      .string()
      .min(1, { message: 'First name is required' })
      .max(50, { message: 'First name must be less than or equal to 50 characters' }),
    last_name: z
      .string({ required_error: 'Last name is required' })
      .min(1, { message: 'Last name is required' })
      .max(50, { message: 'Last name must be less than or equal to 50 characters' }),
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .min(1, { message: 'Email is required' })
      .max(50, { message: 'Email must be less than or equal to 50 characters' }),
    password: passwordSchema,
    confirm_password: passwordSchema,
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password do not match',
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

const SignUpForm = ({ setAuthMethod }: { setAuthMethod: (data: AuthData) => void }) => {
  const t = useTranslations('signUp')
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
    mode: 'all',
  })

  const { isDirty, isValid } = form.formState
  const [isAuthenticating, setIsAuthenticating] = useState(false)

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

        return res?.data?.message || 'Sign up successful!'
      },
      error: (error: ApiResponse) => {
        return error?.message || 'Something went wrong'
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
                    <InputWithIcon prefixCpn={<Mail size={16} />} {...field} placeholder="Email" />
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
                      type="password"
                      prefixCpn={<LockKeyhole size={16} />}
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
                      type="password"
                      prefixCpn={<LockKeyhole size={16} />}
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

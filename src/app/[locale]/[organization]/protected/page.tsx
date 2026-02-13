'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
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
import { SpaceDFLogoFull } from '@/components/icons'
import { TypographySecondary } from '@/components/ui/typography'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { PRODUCTION_SITE_URL } from '@/shared/env'

const passwordSchema = z.object({
  password: z.string().min(1, { message: 'Password is required' }),
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ProtectedPage() {
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isAuthenticating, startAuthentication] = useTransition()
  const router = useRouter()
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })
  const { organization } = useParams()
  const t = useTranslations('common')

  const onSubmit = (value: PasswordFormValues) => {
    startAuthentication(async () => {
      try {
        const res = await fetch('/api/verify-dev-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: value.password }),
        })

        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Invalid password')
          return
        }
        router.replace('/')
      } catch {
        toast.error('An error occurred. Please try again.')
      }
    })
  }

  return (
    <div className="flex h-screen w-screen mx-auto flex-col items-center justify-center">
      <div className="w-fit">
        <div className="flex space-x-6 items-center">
          <SpaceDFLogoFull width={300} height={64} />
          <div className="font-semibold text-3xl p-3 px-5 bg-black text-white rounded-full">{`</> Dev Environment`}</div>
        </div>
        <div className="w-full animate-opacity-display-effect self-start">
          <h1 className="my-6 text-3xl font-semibold text-center">
            Authentication Required
          </h1>
          <TypographySecondary className="mb-6 text-base text-center">
            This is the development environment. Please switch to our{' '}
            <a
              href={`https://${organization}.${PRODUCTION_SITE_URL}`}
              className="bg-gradient-to-r from-[#6580EB] via-[#9957EC] to-[#B443ED] bg-clip-text text-transparent text-base font-semibold"
            >
              Official Website
            </a>
          </TypographySecondary>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 mx-14">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-brand-component-text-gray text-sm font-semibold">
                        Password
                      </FormLabel>
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
                          placeholder="Password"
                          isError={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="mb-2 mt-6 h-11 w-full rounded-lg border-4 border-brand-heading bg-brand-fill-outermost shadow-sm"
                loading={isAuthenticating}
              >
                Sign In
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full">
        <div className="w-full text-center mb-4">
          <span className="text-brand-component-text-gray text-sm leading-7 font-normal">
            {t('powered_by')}{' '}
            <span className="text-brand-component-text-dark font-bold">
              SpaceDF
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

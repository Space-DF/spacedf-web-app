import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { useState, useTransition } from 'react'
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
import { Input, InputWithIcon } from '@/components/ui/input'
import {
  TypographyPrimary,
  TypographySecondary,
} from '@/components/ui/typography'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'
import { passwordSchema } from '@/utils'
import { useAuthForm } from './stores/useAuthForm'
import { useQueryClient } from '@tanstack/react-query'
import { useSubscribeNotification } from '@/hooks/useSubscribeNotification'

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
  const initialData = useAuthForm(useShallow((state) => state.initialData))
  const setFormType = useAuthForm((state) => state.setFormType)
  const t = useTranslations('signUp')
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
  })
  const [isShowPassword, setIsShowPassword] = useState(false)

  const [isAuthenticating, startAuthentication] = useTransition()
  const { registerServiceWorker } = useSubscribeNotification()
  const setOpenDrawer = useIdentityStore((state) => state.setOpenDrawerIdentity)

  const queryClient = useQueryClient()

  const onSubmit = async (value: z.infer<typeof singInSchema>) => {
    startAuthentication(async () => {
      try {
        const res = await signIn('credentials', { redirect: false, ...value })
        if (res?.error) {
          toast.error(t('sign_in_failed_please_try_again'))
        } else {
          await registerServiceWorker()
          setOpenDrawer(false)
          queryClient.clear()
        }
      } catch (error) {
        console.error({ error })
      }
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
            <FormField
              control={form.control}
              name="email"
              defaultValue={initialData?.email}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Email"
                      className=""
                      isError={!!fieldState.error}
                    />
                  </FormControl>

                  <FormMessage className="" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              defaultValue={initialData?.password}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="">{t('password')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type={isShowPassword ? 'text' : 'password'}
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
                      isError={!!fieldState.error}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mb-5 mt-4 flex items-center justify-end">
            <p
              className="cursor-pointer text-xs font-semibold hover:underline text-foreground"
              onClick={() => setFormType('forgotPassword')}
            >
              {t('forgot_password')}
            </p>
          </div>
          <Button
            type="submit"
            className="mb-2 w-full border-4 shadow-sm"
            loading={isAuthenticating}
          >
            {t('sign_in')}
          </Button>
        </form>
      </Form>
      <div className="flex items-center justify-center gap-2 text-center text-xs">
        <TypographySecondary className="font-semibold text-brand-component-text-gray">
          {t('dont_have_an_account')}
        </TypographySecondary>
        <span
          className="cursor-pointer font-semibold hover:underline text-foreground"
          onClick={() => setFormType('signUp')}
        >
          {t('sign_up')}
        </span>
      </div>
    </div>
  )
}

export default SignInForm

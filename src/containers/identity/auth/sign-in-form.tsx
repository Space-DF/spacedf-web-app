import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
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
import { InputWithIcon } from '@/components/ui/input'
import {
  TypographyPrimary,
  TypographySecondary,
} from '@/components/ui/typography'
import { AuthData } from '.'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'
import { passwordSchema } from '@/utils'

const singInSchema = z.object({
  email: z
    .string({ message: 'Email cannot be empty' })
    .email({ message: 'Please enter a valid email address' })
    .min(1, { message: 'Email is required' })
    .max(50, { message: 'Email must be less than or equal to 50 characters' }),

  password: passwordSchema,
  remember_me: z.boolean().optional(),
})

const SignInForm = ({
  setAuthMethod,
  initialData,
}: {
  setAuthMethod: (data: AuthData) => void
  initialData: AuthData['data']
}) => {
  const t = useTranslations('signUp')
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
    defaultValues: {
      email: 'sgt+02@yopmail.com',
      password: '@Aa123123',
    },
  })
  const [isShowPassword, setIsShowPassword] = useState(false)

  const [isAuthenticating, startAuthentication] = useTransition()

  const { setOpenDrawer } = useIdentityStore(
    useShallow((state) => ({
      openDrawer: state.openDrawerIdentity,
      setOpenDrawer: state.setOpenDrawerIdentity,
    })),
  )

  const onSubmit = (value: z.infer<typeof singInSchema>) => {
    startAuthentication(async () => {
      try {
        const res = await signIn('credentials', { redirect: false, ...value })
        if (!res?.ok) {
          toast.error(t('sign_in_failed_please_try_again'))
        } else {
          setOpenDrawer(false)
        }
      } catch (error) {
        console.log({ error })
      }
    })
  }
  return (
    <div className="w-full animate-opacity-display-effect self-start">
      {/* <p className=" font-semibold">Or continue with email address</p> */}
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
              defaultValue={initialData?.password}
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
            className="mb-2 h-11 w-full rounded-lg border-4 border-brand-heading bg-brand-fill-outermost shadow-sm"
            loading={isAuthenticating}
          >
            {t('sign_in')}
          </Button>
        </form>
      </Form>
      <div className="flex items-center justify-center gap-2 text-center text-xs">
        <TypographySecondary className="font-semibold">
          {t('dont_have_an_account')}
        </TypographySecondary>
        <span
          className="cursor-pointer font-semibold hover:underline"
          onClick={() => setAuthMethod({ method: 'signUp' })}
        >
          {t('sign_up')}
        </span>
      </div>
    </div>
  )
}

export default SignInForm

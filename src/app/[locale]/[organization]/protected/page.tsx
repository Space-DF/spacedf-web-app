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
    <div className="my-10 flex h-screen w-screen mx-auto flex-col items-center justify-center md:max-w-md">
      <SpaceDFLogoFull />
      <div className="w-full animate-opacity-display-effect self-start">
        <h1 className="my-6 text-3xl font-semibold text-center">
          Authentication Required
        </h1>
        <TypographySecondary className="mb-6 text-base text-center">
          This site is protected by a password.
        </TypographySecondary>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="tracking-wider">Password</FormLabel>
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
                        placeholder="Enter password"
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
              Log in
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

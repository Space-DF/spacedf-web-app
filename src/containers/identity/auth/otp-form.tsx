import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { SignUpFormCredentials } from '.'
import useSendOTP from './hooks/useSendOTP'
import useJoinSpace from './hooks/useJoinSpace'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'
import { useSearchParams } from 'next/navigation'
import useSignUp from './hooks/useSignUp'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

export const OTPSchema = z.object({
  otp: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
})

const TIME_REMAINING = 60

const OTPForm = () => {
  const t = useTranslations('signUp')
  const signUpForm = useFormContext<SignUpFormCredentials>()
  const form = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
  })

  const { setOpenDrawer, setOpenGuideline } = useIdentityStore(
    useShallow((state) => ({
      setOpenDrawer: state.setOpenDrawerIdentity,
      setOpenGuideline: state.setOpenGuideline,
    }))
  )

  const queryClient = useQueryClient()

  const { trigger: triggerSignUp, isMutating: isMutatingSignUp } = useSignUp()

  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const email = signUpForm.watch('email')
  const [timeRemaining, setTimeRemaining] = useState(TIME_REMAINING)

  const { trigger: triggerSendOtp, isMutating: isMutatingSendOtp } =
    useSendOTP()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => Math.max(0, prevTime - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleResendOTP = async () => {
    await triggerSendOtp(email)
    setTimeRemaining(TIME_REMAINING)
  }

  const { isDirty, isValid, errors } = form.formState
  const { trigger: joinSpace } = useJoinSpace()

  const isInvalidCode = !!errors.otp?.message

  const onSubmit = async () => {
    const value = signUpForm.getValues()

    const res = await triggerSignUp(
      {
        ...value,
        otp: form.getValues('otp'),
      },
      {
        onError: (error) => {
          form.setError('otp', { message: error.message })
        },
      }
    )

    await signIn('credentials', {
      redirect: false,
      signUpSuccessfully: true,
      dataUser: JSON.stringify(res),
    })
    queryClient.clear()
    setOpenDrawer(false)
    if (!token) {
      setOpenGuideline(true)
      return
    }
    await joinSpace(token)
  }

  return (
    <div className="w-full animate-opacity-display-effect self-start">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center gap-4 space-y-0">
                <FormLabel className="flex w-full items-center justify-center gap-1 text-[14px] font-medium leading-5">
                  <span className="text-brand-component-text-gray">
                    {t('otp_sent')}
                  </span>
                  <span className="text-brand-component-text-dark dark:text-white">
                    {email}
                  </span>
                </FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup className="justify-center gap-[10px]">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className={cn(
                            'h-9 w-9 rounded-xl border bg-input text-[14px] font-medium first:rounded-l-xl last:rounded-r-xl',
                            isInvalidCode &&
                              'border-red-600 bg-brand-component-fill-negative-soft'
                          )}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              loading={isMutatingSignUp}
              disabled={!isDirty || !isValid || isMutatingSignUp}
            >
              {t('continue')}
            </Button>
            <div className="flex items-center justify-center">
              <span className="text-[14px] font-medium leading-5 text-brand-component-text-gray">
                {t('didnt_receive_a_code')}
              </span>
              <Button
                className="h-8 px-1 text-[12px] font-semibold leading-[18px] text-brand-component-text-gray"
                variant="ghost"
                type="button"
                disabled={timeRemaining > 0}
                onClick={handleResendOTP}
                loading={isMutatingSendOtp}
              >
                {t('resend_code', {
                  time: `${String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:${String(timeRemaining % 60).padStart(2, '0')}`,
                })}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default OTPForm

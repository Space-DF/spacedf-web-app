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
import { Separator } from '@/components/ui/separator'
import { SignUpFormCredentials } from '.'
import useSendOTP from './hooks/useSendOTP'
import useJoinSpace from './hooks/useJoinSpace'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'
import { useSearchParams } from 'next/navigation'
import useSignUp from './hooks/useSignUp'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'

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
      sigUpSuccessfully: true,
      dataUser: JSON.stringify(res),
    })
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-[14px]">
                    {t('otp_sent')} <span className="font-bold">{email}</span>
                  </FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className="w-full gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={cn(
                              'h-[70px] w-auto flex-1 rounded-lg border border-transparent bg-brand-fill-dark-soft text-2xl font-bold',
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
          </div>
          <Button
            type="submit"
            className="mt-5 h-12 w-full shadow-none"
            loading={isMutatingSignUp}
            disabled={!isDirty || !isValid || isMutatingSignUp}
          >
            {t('continue')}
          </Button>
          <Separator className="my-4" />
          <Button
            className="h-12 w-full shadow-none"
            variant="outline"
            type="button"
            disabled={timeRemaining > 0}
            onClick={handleResendOTP}
            loading={isMutatingSendOtp}
          >
            {t('resend_code', {
              time: `${String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:${String(timeRemaining % 60).padStart(2, '0')}`,
            })}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default OTPForm

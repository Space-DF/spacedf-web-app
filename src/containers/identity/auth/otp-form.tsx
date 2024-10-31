import React from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
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

export const OTPSchema = z.object({
  otp: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
})

const TIME_REMAINING = 60

const OTPForm = () => {
  const t = useTranslations('signUp')
  const form = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
  })
  const [timeRemaining, setTimeRemaining] = React.useState(TIME_REMAINING)
  const [isAuthenticating, setIsAuthenticating] = React.useState(false)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => Math.max(0, prevTime - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleResendOTP = () => {
    setTimeRemaining(TIME_REMAINING)
  }

  const { isDirty, isValid } = form.formState

  const onSubmit = async (value: z.infer<typeof OTPSchema>) => {
    console.info(`\x1b[34mFunc: onSubmit - PARAMS: value\x1b[0m`, value)
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
                  <FormLabel>
                    {t('we_sent_a_code_to_email', {
                      email: 'digitalfortress@gmail.com',
                    })}
                  </FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className="w-full gap-6">
                        <InputOTPSlot
                          index={0}
                          className="h-20 w-auto flex-1 rounded-lg border border-transparent bg-brand-fill-dark-soft text-2xl font-bold"
                        />
                        <InputOTPSlot
                          index={1}
                          className="h-20 w-auto flex-1 rounded-lg border border-transparent bg-brand-fill-dark-soft text-2xl font-bold"
                        />
                        <InputOTPSlot
                          index={2}
                          className="h-20 w-auto flex-1 rounded-lg border border-transparent bg-brand-fill-dark-soft text-2xl font-bold"
                        />
                        <InputOTPSlot
                          index={3}
                          className="h-20 w-auto flex-1 rounded-lg border border-transparent bg-brand-fill-dark-soft text-2xl font-bold"
                        />
                        <InputOTPSlot
                          index={4}
                          className="h-20 w-auto flex-1 rounded-lg border border-transparent bg-brand-fill-dark-soft text-2xl font-bold"
                        />
                        <InputOTPSlot
                          index={5}
                          className="h-20 w-auto flex-1 rounded-lg border border-transparent bg-brand-fill-dark-soft text-2xl font-bold"
                        />
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
            loading={isAuthenticating}
            disabled={!isDirty || !isValid}
          >
            {t('continue')}
          </Button>
          <Separator className="my-4" />
          <Button
            className="h-12 w-full shadow-none"
            variant="outline"
            disabled={timeRemaining > 0}
            onClick={handleResendOTP}
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

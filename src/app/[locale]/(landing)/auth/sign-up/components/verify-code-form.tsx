'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
})

export default function VerifyCodeForm() {
  const t = useTranslations('signUp')
  const [seconds, setSeconds] = useState(60)
  const [isResendEnabled, setIsResendEnabled] = useState(false)
  const rootAuth = useIdentityStore(useShallow((state) => state.rootAuth))

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  })
  const { isDirty, isValid } = form.formState

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.info(`\x1b[34mFunc: onSubmit - PARAMS: data\x1b[0m`, data)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds - 1)
      }, 1000)
    } else {
      setIsResendEnabled(true)
    }
    return () => clearInterval(interval)
  }, [seconds])

  const handleResendOTP = () => {
    setSeconds(60)
    setIsResendEnabled(false)
  }

  return (
    <div className="mx-auto my-10 flex size-full flex-col items-center justify-center px-5 md:max-w-xl">
      <p className="my-6 text-3xl font-semibold">{t('sign_up_to_SpaceDF')}</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>
                  {t.rich('we_sent_a_code_to', {
                    email: rootAuth[0],
                    span: (chunk) => (
                      <span className="font-semibold text-brand-text-dark">
                        {chunk}
                      </span>
                    ),
                  })}
                </FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    {...field}
                  >
                    <InputOTPGroup className="w-full gap-6">
                      <InputOTPSlot
                        index={0}
                        className="h-20 flex-1 rounded-md border-none bg-brand-component-fill-dark-soft text-2xl font-bold"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-20 flex-1 rounded-md border-none bg-brand-component-fill-dark-soft text-2xl font-bold"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-20 flex-1 rounded-md border-none bg-brand-component-fill-dark-soft text-2xl font-bold"
                      />
                      <InputOTPSlot
                        index={3}
                        className="h-20 flex-1 rounded-md border-none bg-brand-component-fill-dark-soft text-2xl font-bold"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-20 flex-1 rounded-md border-none bg-brand-component-fill-dark-soft text-2xl font-bold"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-20 flex-1 rounded-md border-none bg-brand-component-fill-dark-soft text-2xl font-bold"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-semibold text-white shadow-sm dark:border-brand-component-stroke-light"
            disabled={!isDirty || !isValid}
          >
            {t('continue')}
          </Button>
        </form>
      </Form>
      <Separator className="my-4 bg-brand-component-stroke-dark-soft dark:bg-brand-component-stroke-dark-soft" />
      <Button
        className="h-12 w-full items-center gap-2 rounded-lg border border-brand-component-stroke-dark text-sm font-semibold dark:border-brand-component-stroke-light"
        variant="outline"
        disabled={!isResendEnabled}
        onClick={handleResendOTP}
      >
        {t.rich('resend_code', { time: seconds })}
      </Button>
    </div>
  )
}

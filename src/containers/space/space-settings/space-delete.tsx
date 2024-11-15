'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { useSpaceSettings } from '@/stores/space-settings-store'

const formSchema = z
  .object({
    text: z.string({ message: 'This field cannot be empty' }),
  })
  .refine((data) => data.text === 'DELETE', {
    message:
      "Incorrect confirmation. Please type 'Delete' to confirm deletion.",
    path: ['text'],
  })

export function SpaceDelete() {
  const t = useTranslations('space')
  const { setStep } = useSpaceSettings()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  // 2. Define a submit handler.
  function onSubmit() {
    // @TODO: handle delete space
  }

  return (
    <div className="flex h-full animate-display-effect flex-col">
      <div className="flex items-center border-b border-brand-component-stroke-dark-soft p-4 font-semibold text-brand-component-text-dark">
        <ArrowLeft
          size={20}
          className="mr-2 cursor-pointer"
          onClick={() => setStep('information')}
        />
        {t('delete_space')}
      </div>
      <div className="grow-1 flex-1 shrink-0 basis-0">
        <div className="animate-display-effect p-4">
          <div className="inline-flex items-center gap-1 rounded bg-brand-component-fill-negative-soft p-2 text-xs font-semibold text-brand-component-text-negative-hover">
            <TriangleAlert size={16} />
            {t('warning_this_is_a_potentially_destructive_action')}
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                      {t('to_confirm_please_type_delete_below')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 rounded-lg border-0 bg-brand-component-fill-dark-soft shadow-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="destructive"
                className="h-12 w-full rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative text-base font-semibold text-brand-component-text-light-fixed dark:border-brand-component-stroke-light"
              >
                {t('delete_space')}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

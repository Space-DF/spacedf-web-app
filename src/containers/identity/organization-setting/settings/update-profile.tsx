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
import { TypographySecondary } from '@/components/ui/typography'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export const UpdateProfile = ({ onNextStep }: { onNextStep: Function }) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  const handleSubmitProfile = (values: ProfileFormValues) => {
    if (!values.first_name && !values.last_name) return onNextStep()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitProfile)}>
        <div className="mb-8 flex w-full items-center gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="flex-1" defaultValue={''}>
                <FormLabel className="">First name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Space user"
                    className="border-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="">Last Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Space user"
                    className="border-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button type="submit">Continue</Button>
          <Button type="button" variant="link" onClick={() => onNextStep()}>
            <TypographySecondary>Skip</TypographySecondary>
          </Button>
        </div>
      </form>
    </Form>
  )
}

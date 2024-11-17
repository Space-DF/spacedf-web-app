'use client'

import React, { memo, useState, useTransition } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useSpaceStore } from '@/stores'
import CreateSpace from './create-space'
import EnterMember from './enter-member'
import PreviewSpaceName from './preview-space-name'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SettingsLoading from '@/containers/space/create-space/loading'

const formSchema = z.object({
  space_name: z
    .string()
    .min(1, {
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
})

export type SpaceFormValues = z.infer<typeof formSchema>

const OrganizationSetting = () => {
  const [steps, setSteps] = useState<keyof typeof layouts>('create')
  const { isLoading } = useSpaceStore(useShallow((state) => state))
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const [isCreating, startCreateSpace] = useTransition()

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    startCreateSpace(async () => {
      // const response = await fetch('/api/console/organization', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     name: organizationName,
      //     slug_name: organizationDomain,
      //     logo: '123',
      //   }),
      // })
      // const dataResponse = await response.json()
      //
      // if (response.ok) {
      //   toast.success('Organization created successfully!')
      //   setOrganization(dataResponse.data.slug_name)
      // }
      setSteps('member')
    })
  }

  const layouts = {
    create: (
      <>
        <Form {...form}>
          <form className="flex w-full" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="w-1/2">
              <CreateSpace isCreating={isCreating} />
            </div>
            <div className="w-1/2">
              <PreviewSpaceName />
            </div>
          </form>
        </Form>
      </>
    ),
    member: <EnterMember />,
  } as const

  return (
    <div className="flex size-full flex-1 overflow-hidden px-10 py-4">
      {layouts[steps || 'create']}
      {isLoading && <SettingsLoading />}
    </div>
  )
}

export default memo(OrganizationSetting)

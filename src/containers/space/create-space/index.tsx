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
import CreateLoading from '@/containers/space/create-space/loading'
import { ApiResponse } from '@/types/global'
import { toSlug } from '@/utils'

const formSchema = z.object({
  space_name: z
    .string({
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
})

export type SpaceFormValues = z.infer<typeof formSchema>

const OrganizationSetting = () => {
  const { isLoading } = useSpaceStore(useShallow((state) => state))
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const [isCreating, startCreateSpace] = useTransition()

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    startCreateSpace(async () => {
      const fetchPromise = await fetch('/api/spaces', {
        method: 'POST',
        body: JSON.stringify({
          // @TODO: implement upload image
          logo: 'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg',
          name: values.space_name,
          slug_name: toSlug(values.space_name),
          is_active: true,
        }),
      })

      console.info(
        `\x1b[34mFunc: fetchPromise - PARAMS: fetchPromise\x1b[0m`,
        fetchPromise,
      )

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
    })
  }

  return (
    <div className="flex size-full flex-1 overflow-hidden px-10 py-4">
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
      {isLoading && <CreateLoading />}
    </div>
  )
}

export default memo(OrganizationSetting)

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
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImRlZmF1bHQiLCJ0eXAiOiJKV1QifQ.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxOTkzMDI1LCJpYXQiOjE3MzE5ODk0MjUsImp0aSI6IjA3MzJkZDEzNjY3OTRlZmRiMjE1YzYyNmFmOThmODM3IiwidXNlcl9pZCI6NSwiaXNzIjoiaHR0cHM6Ly9zcGFjZWRmLWZlLmFwaS52MC5zcGFjZWRmLm5ldC8iLCJwZXJtaXNzaW9ucyI6WyJSRUFEX0RBU0hCT0FSRCIsIlJFQURfREVWSUNFX1NUQVRFIiwiVVBEQVRFX0RBU0hCT0FSRCIsIkRFTEVURV9TUEFDRSIsIkRFTEVURV9TUEFDRV9ST0xFIiwiUkVBRF9TUEFDRV9ST0xFIiwiUkVBRF9TUEFDRV9NRU1CRVIiLCJDUkVBVEVfREFTSEJPQVJEIiwiVVBEQVRFX1NQQUNFIiwiSU5WSVRFX1NQQUNFX01FTUJFUiIsIkNSRUFURV9TUEFDRV9ST0xFIiwiUkVNT1ZFX1NQQUNFX01FTUJFUiIsIlVQREFURV9TUEFDRV9ST0xFIiwiVVBEQVRFX1NQQUNFX01FTUJFUl9ST0xFIiwiREVMRVRFX0RBU0hCT0FSRCJdLCJzcGFjZSI6ImRlZmF1bHQtNSJ9.dPdfrTz2uYq0nGiubjfZ54n3GmF9wqsI4X883vDSxyYfZuwlSa5Sf6MmAgcj4N5UKXuXw0UFNvjFC2jQPwjCNg',
        },
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

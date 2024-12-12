'use client'

import React, { memo, useState } from 'react'
import CreateSpace from './create-space'
import PreviewSpaceName from './preview-space-name'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import CreateLoading from '@/containers/space/create-space/loading'
import { toSlug } from '@/utils'
import { useRouter } from '@/i18n/routing'
import { toast } from 'sonner'

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  const router = useRouter()

  const [isCreating, setCreating] = useState(false)

  const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const fetchPromise = await fetch('/api/spaces', {
        method: 'POST',
        body: JSON.stringify({
          // TODO: handle upload logo
          logo: 'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg',
          name: values.space_name,
          slug_name: toSlug(values.space_name),
          is_active: true,
        }),
      }).then(async (response) => {
        const result = await response.json()
        if (!response.ok) {
          const [errorData] = result.slug_name

          throw new Error(errorData || 'Something went wrong')
        }
        return result
      })
      setCreating(true)
      await sleep(3000)
      if (fetchPromise.data) {
        router.push(`/spaces/${fetchPromise.data.slug_name}`)
      }
    } catch (err) {
      const { message } = err as Error
      toast.error(message)
    }
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
      {isCreating && <CreateLoading />}
    </div>
  )
}

export default memo(OrganizationSetting)

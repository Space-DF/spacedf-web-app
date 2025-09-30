'use client'

import { Form } from '@/components/ui/form'
import { useRouter } from '@/i18n/routing'
import { useGlobalStore } from '@/stores'
import { toSlug } from '@/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'
import CreateSpace from './create-space'
import PreviewSpaceName from './preview-space-name'
import { useGetSpaces } from '@/app/[locale]/[organization]/(withAuth)/spaces/hooks'
import { useIsDemo } from '@/hooks/useIsDemo'
import { useRefreshToken } from '../space-settings/hooks/useRefreshToken'

const formSchema = z.object({
  space_name: z
    .string({
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
  logo: z.string().optional(),
})

export type SpaceFormValues = z.infer<typeof formSchema>

const OrganizationSetting = () => {
  const form = useForm<SpaceFormValues>({
    resolver: zodResolver(formSchema),
  })
  const router = useRouter()
  const { setLoadingText } = useGlobalStore(useShallow((state) => state))
  const t = useTranslations('space')
  const [isCreating, setIsCreating] = useState(false)
  const { mutate: getSpaces } = useGetSpaces()

  const isDemo = useIsDemo()
  const { trigger: refreshToken } = useRefreshToken()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const fetchPromise = await fetch('/api/spaces', {
        method: 'POST',
        body: JSON.stringify({
          // TODO: handle upload logo
          logo:
            values.logo ||
            'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg',
          name: values.space_name,
          slug_name: toSlug(values.space_name),
          is_active: true,
        }),
      })
        .then(async (response) => {
          const result = await response.json()
          if (!response.ok) {
            const [errorData] = result.slug_name

            throw new Error(errorData || 'Something went wrong')
          }
          return result
        })
        .finally(async () => {
          await refreshToken()
          setIsCreating(false)
        })
      setLoadingText({
        duration: 3000,
        loadingTitle: t('congratulations'),
        loadingDescription: t(
          'youve_created_your_new_space_you_can_add_your_member_in_the_space_settings'
        ),
      })
      if (isDemo) {
        return router.push(`/`)
      }
      if (fetchPromise.data) {
        await getSpaces()
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
      {/*{isCreating && <CreateLoading />}*/}
    </div>
  )
}

export default memo(OrganizationSetting)

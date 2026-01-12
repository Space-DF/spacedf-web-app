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
import CreateSpace from './create-space'
import PreviewSpaceName from './preview-space-name'
import { useGetSpaces } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/spaces/hooks'
import { useIsDemo } from '@/hooks/useIsDemo'
import { useRefreshToken } from '../space-settings/hooks/useRefreshToken'
import { useCreateSpace } from './hooks/useCreateSpace'

const formSchema = z.object({
  space_name: z
    .string({
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
  logo: z.instanceof(File).optional(),
})

export type SpaceFormValues = z.infer<typeof formSchema>

const OrganizationSetting = () => {
  const form = useForm<SpaceFormValues>({
    resolver: zodResolver(formSchema),
  })
  const router = useRouter()
  const setLoadingText = useGlobalStore((state) => state.setLoadingText)
  const t = useTranslations('space')
  const { mutate: getSpaces } = useGetSpaces()
  const { trigger: createSpace, isMutating: isCreating } = useCreateSpace()
  const [isLoading, setIsLoading] = useState(false)
  const isDemo = useIsDemo()
  const { trigger: refreshToken } = useRefreshToken()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    await createSpace(
      {
        logo: values.logo,
        name: values.space_name,
        slug_name: toSlug(values.space_name),
        is_active: true,
      },
      {
        onSuccess: async (data) => {
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
          if (data) {
            await refreshToken()
            await getSpaces()
            router.push(`/spaces/${data.slug_name}`)
          }
        },
        onError: (error) => {
          toast.error(error.message)
          setIsLoading(false)
        },
      }
    )
  }

  return (
    <div className="flex size-full flex-1 overflow-hidden px-10 py-4">
      <Form {...form}>
        <form className="flex w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-1/2">
            <CreateSpace isCreating={isCreating || isLoading} />
          </div>
          <div className="w-1/2">
            <PreviewSpaceName />
          </div>
        </form>
      </Form>
    </div>
  )
}

export default memo(OrganizationSetting)

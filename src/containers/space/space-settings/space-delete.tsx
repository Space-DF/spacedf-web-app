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
import { Space } from '@/types/space'

import { useRouter } from '@/i18n/routing'
import {
  useDeleteSpace,
  useGetSpaces,
} from '@/app/[locale]/[organization]/(withAuth)/spaces/hooks'
import { useIsDemo } from '@/hooks/useIsDemo'
import { useRefreshToken } from './hooks/useRefreshToken'

const formSchema = z.object({
  text: z.string({ message: 'This field cannot be empty' }),
})

export function SpaceDelete({ space }: { space: Space }) {
  const t = useTranslations('space')
  const deleteSpace = useDeleteSpace()
  const router = useRouter()
  const { setStep } = useSpaceSettings()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  const { trigger: refreshToken } = useRefreshToken()
  const { data: spaces } = useGetSpaces()
  const spaceList = spaces?.data?.results || []

  const isDemo = useIsDemo()
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.text !== space.name) {
      form.setError('text', {
        message: `Incorrect confirmation. Please type '${space.name}' to confirm deletion.`,
      })
      return
    }
    if (!isDemo) {
      await deleteSpace.trigger({
        slug_name: space.slug_name,
        name: space.name,
      })
      await refreshToken()
    }
    const spaceFirst = spaceList.filter(
      ({ slug_name }) => slug_name !== space.slug_name
    )[0]
    router.push(spaceFirst?.slug_name ? `/spaces/${spaceFirst.slug_name}` : '/')
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
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                      {t.rich('to_confirm_please_type_delete_below', {
                        spaceName: `"${space.name}"`,
                      })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 rounded-lg border-0 bg-brand-component-fill-dark-soft shadow-none"
                        {...field}
                        isError={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={deleteSpace.isMutating}
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

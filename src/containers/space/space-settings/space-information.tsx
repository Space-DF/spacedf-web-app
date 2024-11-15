import { ArrowLeft, ScrollText, Trash, UploadCloud } from 'lucide-react'
import React from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ImageWithBlur from '@/components/ui/image-blur'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import OrganizationThumb from '/public/images/organization-thumb.svg'
import { Textarea } from '@/components/ui/textarea'
import { useSpaceSettings } from '@/stores/space-settings-store'
import { UserList } from '@/components/icons'

export function SpaceInformation() {
  const t = useTranslations()
  return (
    <div className="flex h-full animate-display-effect flex-col">
      <div className="flex items-center border-b border-brand-component-stroke-dark-soft p-4 font-semibold text-brand-component-text-dark">
        {t('common.workspace_settings')}
      </div>
      <div className="grow-1 flex-1 shrink-0 basis-0">
        <Tabs
          defaultValue="information"
          className="flex h-full animate-display-effect flex-col"
        >
          <TabsList className="relative flex h-auto w-full items-center justify-start rounded-none bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-brand-component-stroke-dark-soft">
            <TabsTrigger
              value="information"
              className="relative inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-none border-b-2 border-b-transparent px-4 py-3 text-sm font-semibold text-brand-component-text-dark shadow-none ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-brand-component-text-dark data-[state=active]:shadow-none"
            >
              <ScrollText size={16} />
              {t('space.informations')}
            </TabsTrigger>
            <TabsTrigger
              value="member"
              className="relative inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-none border-b-2 border-b-transparent px-4 py-3 text-sm font-semibold text-brand-component-text-dark shadow-none ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <UserList />
              {t('space.members')}
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-0 h-full" value="information">
            <InformationTab />
          </TabsContent>
          <TabsContent className="mt-0 h-full" value="member">
            <MemberTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const formSchema = z.object({
  space_name: z
    .string()
    .min(1, {
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
  created_at: z
    .string()
    .min(1, {
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
  owner: z.string(),
  space_member: z.string(),
  description: z.string().optional(),
})

function InformationTab() {
  const t = useTranslations('space')
  const { setStep } = useSpaceSettings()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      space_name: 'Space ABCD',
      created_at: '2024/10/29',
      owner: 'Digital Fortress',
      space_member: '10',
      description: '',
    },
  })

  function onSubmit() {}

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <Form {...form}>
        <form
          className="flex w-full flex-1 flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-3">
            <FormLabel className="text-brand-component-text-dark">
              {t('space_image')}
            </FormLabel>
            <div className="flex gap-3">
              <div className="size-24 rounded-lg">
                <ImageWithBlur
                  src={OrganizationThumb}
                  className="size-full rounded-lg object-cover"
                  alt=""
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-lg text-base font-semibold text-brand-component-text-dark shadow-none"
                >
                  {t('upload_image')}
                  <UploadCloud size={20} className="-scale-x-100" />
                </Button>
                <p className="text-xs text-brand-component-text-gray">
                  {t('800x800_png_jpg_is_recommended_maximum_file_size_5mb')}
                </p>
              </div>
            </div>
          </div>
          <FormField
            control={form.control}
            name="space_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-component-text-dark">
                  {t('space_name')}
                  <span className="text-brand-component-text-negative">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('space_name')}
                    className="h-10 border-0 shadow-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="created_at"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-component-text-dark">
                    {t('creation_date')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      className="h-10 border-0 shadow-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-component-text-dark">
                    {t('owner_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      className="h-10 border-0 shadow-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="space_member"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-component-text-dark">
                    {t('space_member')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      className="h-10 border-0 shadow-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-component-text-gray">
                  {t('description_of_the_space')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('enter_the_description')}
                    className="resize-none border-0 shadow-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2.5">
            <Button
              onClick={() => form.reset()}
              type="button"
              className="h-12 flex-1 rounded-lg border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none hover:text-brand-component-text-gray-hover dark:bg-transparent"
              variant="outline"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="h-12 flex-1 items-center rounded-lg border-4 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-medium text-brand-component-text-light-fixed shadow-sm dark:border-brand-component-stroke-light dark:bg-brand-component-fill-secondary"
            >
              {t('save_changes')}
            </Button>
          </div>
        </form>
      </Form>
      <div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setStep('delete')}
          className="gap-2 border-brand-component-stroke-negative bg-transparent text-sm font-semibold text-brand-component-text-negative hover:bg-transparent hover:text-brand-component-text-negative-hover"
        >
          <Trash size={20} />
          {t('delete_space')}
        </Button>
      </div>
    </div>
  )
}

function MemberTab() {
  return <></>
}

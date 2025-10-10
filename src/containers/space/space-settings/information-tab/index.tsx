import { zodResolver } from '@hookform/resolvers/zod'
import { Trash, UploadCloud } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ImageWithBlur from '@/components/ui/image-blur'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/routing'
import { useSpaceSettings } from '@/stores/space-settings-store'
import OrganizationThumb from '/public/images/organization-thumb.svg'
import { Space } from '@/types/space'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { spaceMemberSchema } from './validator'
import { toast } from 'sonner'
import { useUpdateSpace } from './hooks/useUpdateSpace'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const getDefaultValue = (space: Space) => {
  return {
    ...space,
    created_at: dayjs(space?.created_at).format('YYYY/MM/DD'),
    description: space?.description || '',
  }
}

export function InformationTab({ space }: { space: Space }) {
  const t = useTranslations('space')
  const { setStep } = useSpaceSettings()
  const { setShouldBackToHome, setOpenAlertDialog } = useSpaceSettings()
  const router = useRouter()
  const params = useParams()
  const [previewImage, setPreviewImage] = useState<string>()
  const { trigger: updateSpace, isMutating } = useUpdateSpace()

  const fileRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof spaceMemberSchema>>({
    resolver: zodResolver(spaceMemberSchema),
    defaultValues: getDefaultValue(space),
  })
  const { isDirty } = form.formState

  useEffect(() => {
    setShouldBackToHome(isDirty)
  }, [isDirty])

  useEffect(() => {
    form.reset(getDefaultValue(space))
  }, [space])

  const handleCancel = () => {
    if (isDirty) {
      setOpenAlertDialog(true)
      return
    }
    router.push(`/spaces/${params.spaceSlug}`)
  }

  function onSubmit() {
    updateSpace(form.getValues(), {
      onSuccess: () => {
        toast.success(t('space_updated_successfully'))
      },
      onError: (error) => {
        toast.error(error.message || t('failed_to_update_space'))
      },
    })
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0]
    if (!image) return
    if (image.size > MAX_FILE_SIZE) {
      toast.error(t('800x800_png_jpg_is_recommended_maximum_file_size_5mb'))
      return
    }
    const imageUrl = URL.createObjectURL(image)
    setPreviewImage(imageUrl)
    form.setValue('logo', image)
  }

  return (
    <>
      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
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
                <div className="size-24 rounded-lg border border-brand-component-stroke-dark-soft">
                  <ImageWithBlur
                    src={previewImage || space.logo || OrganizationThumb}
                    className="size-full rounded-lg object-cover"
                    alt=""
                    width={96}
                    height={96}
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-lg text-base font-semibold text-brand-component-text-dark shadow-none"
                    onClick={() => fileRef.current?.click()}
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
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-brand-component-text-dark">
                    {t('space_name')}
                    <span className="text-brand-component-text-negative">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('space_name')}
                      className="h-10 border-0 shadow-none"
                      {...field}
                      isError={!!fieldState.error}
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
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-brand-component-text-dark">
                      {t('creation_date')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        className="h-10 border-0 shadow-none"
                        {...field}
                        isError={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="created_by"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-brand-component-text-dark">
                      {t('owner_name')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        className="h-10 border-0 shadow-none"
                        {...field}
                        isError={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_member"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-brand-component-text-dark">
                      {t('space_member')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        className="h-10 border-0 shadow-none"
                        {...field}
                        isError={!!fieldState.error}
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
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-brand-component-text-gray">
                    {t('description_of_the_space')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('enter_the_description')}
                      className="resize-none border-0 shadow-none"
                      {...field}
                      isError={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2.5">
              <Button
                onClick={handleCancel}
                type="button"
                className="h-12 flex-1 rounded-lg border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none hover:text-brand-component-text-gray-hover dark:bg-transparent"
                variant="outline"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                className="h-12 flex-1 items-center rounded-lg border-4 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-medium text-brand-component-text-light-fixed shadow-sm dark:border-brand-component-stroke-light dark:bg-brand-component-fill-secondary"
                loading={isMutating}
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
    </>
  )
}

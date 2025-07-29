'use client'

import { Loader, UploadCloud } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ImageWithBlur from '@/components/ui/image-blur'
import { Input } from '@/components/ui/input'
import OrganizationThumb from '/public/images/organization-thumb.svg'
import { SpaceFormValues } from '.'
import { useUploadImage } from '@/components/layouts/general-setting/hooks/useUploadImage'
import { useIsDemo } from '@/hooks/useIsDemo'

const Settings = ({ isCreating }: { isCreating: boolean }) => {
  const t = useTranslations('space')
  const form = useFormContext<SpaceFormValues>()
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string>('')
  const { trigger: uploadImage, isMutating } = useUploadImage()
  const isDemo = useIsDemo()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0]
    if (!image) return
    if (isDemo) {
      const imageUrl = URL.createObjectURL(image)
      setPreviewImage(imageUrl)
      return
    }
    const response = await uploadImage(image)
    setPreviewImage(response.presigned_url)
    form.setValue('logo', response.file_name)
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
      <div className="flex size-full items-center justify-center">
        <div className="flex w-4/5 animate-opacity-display-effect flex-col gap-4">
          <div className="flex flex-col gap-3">
            <FormLabel className="text-brand-text-dark">
              {t('space_image')}
            </FormLabel>
            <div className="flex gap-3">
              <div className="size-24 rounded-lg relative bg-purple-200 dark:bg-purple-600">
                <ImageWithBlur
                  src={previewImage || OrganizationThumb}
                  className={'size-full rounded-lg object-cover'}
                  alt=""
                  width={96}
                  height={96}
                  isPending={isMutating}
                />
                {isMutating && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="animate-spin size-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-lg text-base font-semibold text-brand-text-dark shadow-none"
                  disabled={isMutating}
                  onClick={() => fileRef.current?.click()}
                >
                  {t('upload_image')}
                  <UploadCloud size={20} className="-scale-x-100" />
                </Button>
                <p className="text-xs text-brand-text-gray">
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
                <FormLabel className="text-brand-text-dark">
                  {t('space_name')}
                  <span className="text-brand-semantic-accent">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('space_name')}
                    className="border-0 shadow-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button
              type="submit"
              className="h-12 items-center rounded-lg border-2 border-brand-heading bg-brand-fill-outermost font-semibold text-white shadow-sm dark:border-brand-stroke-outermost"
              loading={isCreating}
            >
              {t('create_space')}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings

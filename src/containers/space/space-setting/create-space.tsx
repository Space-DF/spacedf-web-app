'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { UploadCloud } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useTransition } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
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
import OrganizationThumb from '/public/images/organization-thumb.svg'

const Settings = ({ isCreating }: { isCreating: boolean }) => {
  const t = useTranslations('space')
  const form = useFormContext()

  const { isDirty, isValid } = form.formState

  return (
    <>
      <div className="flex size-full items-center justify-center">
        <div className="flex w-4/5 animate-opacity-display-effect flex-col gap-4">
          <div className="flex flex-col gap-3">
            <FormLabel className="text-brand-text-dark">
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
                  variant="outline"
                  className="gap-2 rounded-lg text-base font-semibold text-brand-text-dark shadow-none"
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
                    placeholder="shadcn"
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
              disabled={!isDirty || !isValid}
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

'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import SpaceInformation from '/public/images/space-information.webp'
import SpaceDelete from '/public/images/space-delete.webp'
import ImageWithBlur from '@/components/ui/image-blur'
import React from 'react'
import { useSpaceSettings } from '@/stores/space-settings-store'

export function SpacePreviewImage() {
  const t = useTranslations('space')
  const { step } = useSpaceSettings()

  return (
    <div className="relative flex w-1/2 flex-1 items-center justify-center p-4">
      <Button
        size="sm"
        className="absolute left-4 top-4 items-center gap-2 rounded-lg border-4 border-brand-heading bg-brand-fill-outermost text-sm font-semibold text-white shadow-sm dark:border-brand-stroke-outermost"
      >
        <ArrowLeft size={20} />
        {t('back_to_home')}
      </Button>
      <div>
        {step === 'delete' ? (
          <ImageWithBlur
            src={SpaceDelete}
            className="size-full object-contain"
            alt=""
          />
        ) : (
          <ImageWithBlur
            src={SpaceInformation}
            className="size-full object-contain"
            alt=""
          />
        )}
      </div>
    </div>
  )
}

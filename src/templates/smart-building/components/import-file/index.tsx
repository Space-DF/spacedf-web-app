'use client'

import { Button } from '@/components/ui/button'
import ImageWithBlur from '@/components/ui/image-blur'
import { cn } from '@/lib/utils'
import DrawSVG from '/public/images/draw.svg'
import { useTranslations } from 'next-intl'
import CloudArrowUp from '@/components/icons/cloud-arrow-up'
import { DialogUpload } from './components/dialog-upload'

export type ImportThreeModelProps = {
  className?: string
  isHidden?: boolean
}

export function ImportThreeModel({
  className,
  isHidden,
}: ImportThreeModelProps) {
  const t = useTranslations('smartBuilding')

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-dashed border-brand-component-stroke-gray bg-gradient-to-b from-black/45 to-black/25 p-10 text-center text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)] ring-1 ring-inset ring-white/5 backdrop-blur-md transition-[border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        className,
        isHidden && 'hidden'
      )}
    >
      <>
        <button
          type="button"
          className="pointer-events-auto rounded-lg p-1 flex-col flex outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label={t('import_glb')}
        >
          <div className="size-20">
            <ImageWithBlur src={DrawSVG} alt="" className="h-full w-full" />
          </div>
        </button>
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex flex-col items-center justify-center gap-y-2">
            <p className="text-brand-component-text-light font-semibold text-[16px]">
              {t('upload_your_first_3d_model')}
            </p>
            <DialogUpload
              trigger={
                <Button
                  type="button"
                  size="sm"
                  variant="light"
                  className="gap-2 p-3"
                >
                  {t('upload_3d_building_area')}
                  <CloudArrowUp />
                </Button>
              }
            />
            <span className="text-brand-component-text-gray">
              {t('glb_import_hint')}
            </span>
          </div>
        </div>
      </>
    </div>
  )
}

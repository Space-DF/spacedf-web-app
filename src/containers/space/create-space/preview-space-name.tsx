'use client'
import React from 'react'
import { usePageTransition } from '@/hooks'
import { cn } from '@/lib/utils'
import { getCookie } from '@/utils'
import { AppWireFrameSpace } from '@/components/ui/app-wire-frame-space'
import { useFormContext } from 'react-hook-form'
import { SpaceFormValues } from '.'
import { AppWireFrameSpaceDark } from '@/components/ui/app-wire-frame-space-dark'

const PreviewSpaceName = () => {
  const { startRender } = usePageTransition({ duration: 200 })
  const { watch } = useFormContext<SpaceFormValues>()

  return (
    <div
      className={cn(
        'flex h-full max-h-full translate-x-36 items-end justify-end overflow-hidden rounded-2xl bg-transparent pl-12 pt-12 duration-300',
        { 'translate-x-0 bg-brand-bright-lavender/50': startRender },
      )}
    >
      <div className="size-full overflow-hidden">
        <AppWireFrameSpace
          className={cn(
            'w-full translate-x-36 object-cover opacity-0 transition-all duration-700 dark:hidden',
            { 'translate-x-0 opacity-100': startRender },
          )}
          organization={getCookie('organization', '')}
          spaceName={watch('space_name')}
        />
        <AppWireFrameSpaceDark
          className={cn(
            'hidden h-full w-full translate-x-36 opacity-0 transition-all duration-700 dark:block',
            { 'translate-x-0 opacity-100': startRender },
          )}
          organization={getCookie('organization', '')}
          spaceName={watch('space_name')}
        />
      </div>
    </div>
  )
}

export default PreviewSpaceName

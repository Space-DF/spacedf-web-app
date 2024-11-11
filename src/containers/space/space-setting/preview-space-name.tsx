'use client'
import React from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AppWireFrame } from '@/components/ui/app-wire-frame'
import { usePageTransition } from '@/hooks'
import { cn } from '@/lib/utils'
import { useIdentityStore } from '@/stores/identity-store'

const PreviewSpaceName = () => {
  const { organizationName } = useIdentityStore(
    useShallow((state) => ({
      organizationName: state.organizationName,
      openDrawerIdentity: state.openDrawerIdentity,
    })),
  )

  const { startRender } = usePageTransition({ duration: 200 })

  return (
    <div
      className={cn(
        'flex h-full max-h-full translate-x-36 items-end justify-end overflow-hidden rounded-2xl bg-transparent pl-12 pt-12 duration-300',
        { 'translate-x-0 bg-brand-bright-lavender/50': startRender },
      )}
    >
      <div className="size-full overflow-hidden">
        <AppWireFrame
          className={cn(
            'h-full w-full translate-x-36 opacity-0 transition-all duration-700',
            { 'translate-x-0 opacity-100': startRender },
          )}
          organization={organizationName}
        />
      </div>
    </div>
  )
}

export default PreviewSpaceName

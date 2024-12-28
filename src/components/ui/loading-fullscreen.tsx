import React from 'react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { useTranslations } from 'next-intl'
import { useGlobalStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'

const LoadingFullScreen = ({ className }: { className?: string }) => {
  const { loadingTitle, loadingDescription } = useGlobalStore(
    useShallow((state) => state),
  )

  return (
    <div
      className={cn(
        'pointer-events-none flex size-full flex-col items-center justify-center',
        className,
      )}
    >
      <div className="size-48">
        <Logo />
      </div>
      {loadingTitle && (
        <div className="mb-6 mt-4 max-w-lg text-4xl font-medium tracking-[-0.72px] text-brand-heading dark:text-white">
          {loadingTitle}
        </div>
      )}
      {loadingDescription && (
        <div className="max-w-lg text-center text-lg text-brand-text-gray">
          {loadingDescription}
        </div>
      )}
    </div>
  )
}

export default LoadingFullScreen

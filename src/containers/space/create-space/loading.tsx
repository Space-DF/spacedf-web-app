'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import LoadingFullScreen from '@/components/ui/loading-fullscreen'

const SettingsLoading = () => {
  const t = useTranslations('space')
  return (
    <div className="fixed inset-0 z-10 flex flex-1 animate-display-effect flex-col items-center justify-center bg-white text-center dark:bg-brand-heading">
      <LoadingFullScreen className="h-auto" />
      <div className="mb-6 mt-4 max-w-lg text-4xl font-medium tracking-[-0.72px] text-brand-heading dark:text-white">
        {t('congratulations')}
      </div>
      <div className="max-w-lg text-lg text-brand-text-gray">
        {t(
          'youve_created_your_new_space_you_can_add_your_member_in_the_space_settings'
        )}
      </div>
    </div>
  )
}

export default SettingsLoading

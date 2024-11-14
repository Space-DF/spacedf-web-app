'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import LoadingFullScreen from '@/components/ui/loading-fullscreen'

const SettingsLoading = () => {
  const t = useTranslations('space')
  return (
    <div className="fixed inset-0 z-10 flex flex-1 flex-col items-center justify-center bg-white text-center dark:bg-brand-heading">
      <LoadingFullScreen className="h-auto" />
      <div className="mb-6 mt-4 text-4xl font-medium tracking-[-0.72px] text-brand-heading dark:text-white">
        {t('were_setting_up_your_space')}
      </div>
      <div className="text-lg text-brand-text-gray">
        {t('please_wait_a_couple_second')}
      </div>
    </div>
  )
}

export default SettingsLoading

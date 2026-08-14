'use client'

import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import SettingLayout from '../setting-layout'
import CreateOrganization from './create-organization'

const Settings = () => {
  const t = useTranslations('common')

  const contents = useMemo(() => {
    return {
      title: t('create_your_organization'),
      subscription: t('give_your_organization_a_name_and_icon'),
      children: <CreateOrganization />,
    }
  }, [t])

  return (
    <SettingLayout title={contents.title} subscription={contents.subscription}>
      <div className={cn('animate-opacity-display-effect')}>
        {contents.children}
      </div>
    </SettingLayout>
  )
}

export default Settings

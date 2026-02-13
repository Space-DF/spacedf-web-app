'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import SettingLayout from '../setting-layout'
import CreateOrganization from './create-organization'

const Settings = () => {
  const contents = useMemo(() => {
    return {
      title: 'Create your organization.',
      subscription: 'Give your organization a name and icon or avatar.',
      children: <CreateOrganization />,
    }
  }, [])

  return (
    <SettingLayout title={contents.title} subscription={contents.subscription}>
      <div className={cn('animate-opacity-display-effect')}>
        {contents.children}
      </div>
    </SettingLayout>
  )
}

export default Settings

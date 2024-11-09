'use client'

import React, { memo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import SettingsLoading from '@/containers/space/space-setting/loading'
import { useSpaceStore } from '@/stores'
import CreateSpace from './create-space'
import EnterMember from './enter-member'
import PreviewSpaceName from './preview-space-name'

const OrganizationSetting = () => {
  const [steps, setSteps] = useState<keyof typeof layouts>('create')
  const { isLoading } = useSpaceStore(useShallow((state) => state))

  const layouts = {
    create: (
      <>
        <div className="w-1/2">
          <CreateSpace handleNextStep={() => setSteps('member')} />
        </div>
        <div className="w-1/2">
          <PreviewSpaceName />
        </div>
      </>
    ),
    member: <EnterMember />,
  } as const

  return (
    <div className="flex size-full flex-1 overflow-hidden px-10 py-4">
      {layouts[steps || 'create']}
      {isLoading && <SettingsLoading />}
    </div>
  )
}

export default memo(OrganizationSetting)

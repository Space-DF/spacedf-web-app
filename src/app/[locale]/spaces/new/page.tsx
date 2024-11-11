import React from 'react'
import SpaceSetting from '@/containers/space/space-setting'
import CreateSpaceHeader from '@/containers/space/space-setting/header'

export default function CreateNewSpace() {
  return (
    <div className="flex min-h-dvh flex-col">
      <CreateSpaceHeader />
      <SpaceSetting />
    </div>
  )
}

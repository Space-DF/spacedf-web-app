import React from 'react'
import SpaceSetting from '@/containers/space/create-space'
import CreateSpaceHeader from '@/containers/space/create-space/header'
import CreateSpaceGuard from '@/containers/space/create-space/guard'

export default function CreateNewSpace() {
  return (
    <CreateSpaceGuard>
      <div className="flex min-h-dvh flex-col xl:h-screen">
        <CreateSpaceHeader />
        <SpaceSetting />
      </div>
    </CreateSpaceGuard>
  )
}

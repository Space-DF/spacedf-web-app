import React from 'react'
import SpaceSetting from '@/containers/space/create-space'
import CreateSpaceHeader from '@/containers/space/create-space/header'

export default function CreateNewSpace() {
  return (
    <div className="flex min-h-dvh flex-col xl:h-screen">
      <CreateSpaceHeader />
      <SpaceSetting />
    </div>
  )
}

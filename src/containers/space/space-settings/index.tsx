'use client'

import React from 'react'
import { SpacePreviewImage } from './space-preview-image'
import { SpaceSettings } from './space-settings'
import { useParams } from 'next/navigation'
import { useGetSpaceDetails } from '@/app/[locale]/(auth)/spaces/hooks'
import EffectLayout from '@/components/ui/effect-layout'

export default function WorkspaceSettings() {
  const params = useParams()
  const { data: spaces } = useGetSpaceDetails(params.spaceSlug as string)
  const spaceDetail = spaces?.data

  return (
    <EffectLayout>
      {spaceDetail && (
        <div className="relative flex min-h-dvh bg-brand-background-fill-surface">
          <SpacePreviewImage />
          <SpaceSettings spaceDetail={spaceDetail} />
        </div>
      )}
    </EffectLayout>
  )
}

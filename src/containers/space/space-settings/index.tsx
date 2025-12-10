'use client'

import React from 'react'
import { SpacePreviewImage } from './space-preview-image'
import { SpaceSettings } from './space-settings'
import { useParams } from 'next/navigation'

import EffectLayout from '@/components/ui/effect-layout'
import { useGetSpaceDetails } from '@/app/[locale]/[organization]/(withAuth)/spaces/hooks'

export default function WorkspaceSettings() {
  const params = useParams()
  const {
    data: spaces,
    mutate: mutateSpaceDetails,
    isLoading,
  } = useGetSpaceDetails(params.spaceSlug as string)
  const spaceDetail = spaces?.data.results?.find(
    (space) => space.slug_name === params.spaceSlug
  )
  if (!isLoading && !spaceDetail) {
    return (window.location.href = `/${params.locale}/spaces/${params.spaceSlug}`)
  }

  return (
    <EffectLayout>
      {spaceDetail && (
        <div className="relative flex min-h-dvh bg-brand-background-fill-surface">
          <SpacePreviewImage />
          <SpaceSettings
            spaceDetail={spaceDetail}
            mutateSpaceDetails={mutateSpaceDetails}
          />
        </div>
      )}
    </EffectLayout>
  )
}

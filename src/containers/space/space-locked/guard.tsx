'use client'

import { useParams } from 'next/navigation'
import { ReactNode, useMemo } from 'react'
import {
  useCheckSpaceAccess,
  useGetSpaces,
} from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/spaces/hooks'
import LoadingFullScreen from '@/components/ui/loading-fullscreen'
import SpaceLocked from './space-locked'

const SpaceLockedGuard = ({ children }: { children: ReactNode }) => {
  const params = useParams()
  const spaceSlug = params?.spaceSlug as string | undefined

  const { data: spaces } = useGetSpaces()
  const {
    data: accessData,
    isLoading,
    isError,
  } = useCheckSpaceAccess(spaceSlug)

  const backHref = useMemo(() => {
    const spaceList = spaces?.data?.results || []
    const availableSpaces = spaceList.filter(
      (space) => !space.is_deactivated && space.slug_name !== spaceSlug
    )
    const fallbackSpace =
      availableSpaces.find((space) => space.default_display) ||
      availableSpaces.at(-1)

    return fallbackSpace ? `/spaces/${fallbackSpace.slug_name}` : '/'
  }, [spaces, spaceSlug])

  if (!spaceSlug) {
    return children
  }

  if (isLoading) {
    return <LoadingFullScreen className="min-h-dvh" />
  }

  if (accessData?.is_locked || isError) {
    return <SpaceLocked backHref={backHref} />
  }

  return children
}

export default SpaceLockedGuard

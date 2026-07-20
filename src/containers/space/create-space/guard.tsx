'use client'

import { ReactNode, useMemo } from 'react'
import { useGetSpaces } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/spaces/hooks'
import LoadingFullScreen from '@/components/ui/loading-fullscreen'
import { MAX_LIMIT_SPACE_FREE } from '@/constants'
import { useOrganizationValidationStore } from '@/stores'
import AccessRestricted from './access-restricted'

const CreateSpaceGuard = ({ children }: { children: ReactNode }) => {
  const isPro = useOrganizationValidationStore((state) => state.isPro)
  const hasHydrated = useOrganizationValidationStore(
    (state) => state.hasHydrated
  )
  const { data: spaces, isPending } = useGetSpaces()

  const spaceList = useMemo(() => spaces?.data?.results || [], [spaces])

  const backHref = useMemo(() => {
    const defaultSpace =
      spaceList.find((space) => space.default_display) || spaceList.at(-1)
    return defaultSpace ? `/spaces/${defaultSpace.slug_name}` : '/'
  }, [spaceList])

  if (!hasHydrated || isPending) {
    return <LoadingFullScreen className="min-h-dvh" />
  }

  if (!isPro && spaceList.length >= MAX_LIMIT_SPACE_FREE) {
    return <AccessRestricted backHref={backHref} />
  }

  return children
}

export default CreateSpaceGuard

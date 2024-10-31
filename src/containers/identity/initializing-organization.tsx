/* eslint-disable react-hooks/exhaustive-deps */
import { Logo } from '@/components/ui/logo'
import {
  TypographyPrimary,
  TypographySecondary,
} from '@/components/ui/typography'
import { usePageTransition } from '@/hooks'
import { cn } from '@/lib/utils'
import { useIdentityStore } from '@/stores/identity-store'
import { deleteCookie, setCookie } from '@/utils'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { memo, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

const InitializingOrganization = () => {
  const { startRender } = usePageTransition({ duration: 4000 })
  const { organizationDomain } = useIdentityStore(
    useShallow((state) => ({
      organizationDomain: state.organizationDomain,
    })),
  )

  useEffect(() => {
    if (startRender) {
      const segment = window.location.origin.split('//')

      const rewritePath = `${segment[0]}//${organizationDomain}.${segment[1]}`

      //   deleteCookie("organization")
      //   setCookie("organization", organizationDomain)
      //   router.refresh()
      window.location.href = rewritePath
    }
  }, [startRender])
  return (
    <div
      className={cn(
        'flex animate-opacity-display-effect flex-col items-center justify-center',
      )}
    >
      <div className="h-48 w-48">
        <Logo />
      </div>
      <TypographyPrimary className="mb-6 mt-3 text-3xl font-medium">
        We’re setting things up for you.
      </TypographyPrimary>

      <TypographySecondary className="text-lg font-normal">
        Please wait a couple second
      </TypographySecondary>
    </div>
  )
}

export default memo(InitializingOrganization)

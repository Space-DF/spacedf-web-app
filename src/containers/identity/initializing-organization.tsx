import { Logo } from '@/components/ui/logo'
import {
  TypographyPrimary,
  TypographySecondary,
} from '@/components/ui/typography'
import { usePageTransition } from '@/hooks'
import { cn } from '@/lib/utils'
import { useIdentityStore } from '@/stores/identity-store'
import { memo, useEffect } from 'react'

const InitializingOrganization = () => {
  const { startRender } = usePageTransition({ duration: 4000 })
  const organizationDomain = useIdentityStore(
    (state) => state.organizationDomain
  )

  useEffect(() => {
    if (startRender) {
      const segment = window.location.origin.split('//')
      const rewritePath = `${segment[0]}//${organizationDomain}.${segment[1]}`
      window.location.href = rewritePath
    }
  }, [startRender])
  return (
    <div
      className={cn(
        'flex animate-opacity-display-effect flex-col items-center justify-center'
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

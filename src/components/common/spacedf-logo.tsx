'use client'

import Image from 'next/image'
import { useOrganizationValidationStore } from '@/stores/organization-validation-store'
import { useTheme } from 'next-themes'
import { useMounted } from '@/hooks'

const SpacedfLogo = () => {
  const setting = useOrganizationValidationStore((state) => state.setting)
  const { resolvedTheme } = useTheme()
  const { mounted } = useMounted()

  const currentTheme = mounted ? resolvedTheme : 'light'

  const logoUrl = (() => {
    if (!setting?.themes || setting.themes.length === 0) {
      return null
    }

    const matchedTheme =
      setting.themes.find((t) => t.theme_key === currentTheme) ||
      setting.themes[0]

    return matchedTheme?.url_logo || null
  })()

  return (
    <div className="pointer-events-auto">
      {logoUrl ? (
        <Image
          width={114}
          height={24}
          src={logoUrl}
          alt={setting?.brand_name || 'spacedf-logo'}
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <Image
          src="/images/spacedf-logo.svg"
          alt="spacedf-logo"
          width={114}
          height={24}
          priority
        />
      )}
    </div>
  )
}

export default SpacedfLogo

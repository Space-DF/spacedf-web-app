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
  const isLight = currentTheme === 'light'

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
      <div className="bg-gradient-to-r from-[#6E4AFF] to-[#CCBFFF] p-[1px] rounded-lg">
        <div
          className="w-32 h-[38px] p-2 rounded-lg bg-gradient-to-b from-[#171a28b3] to-[#1f2336b3] bg-white dark:bg-brand-fill-outermost backdrop-blur-xs pointer-events-none"
          style={
            isLight
              ? {
                  background:
                    'linear-gradient(180deg, #C8C8C8 0%, #7B7B7B 100%)',
                }
              : undefined
          }
        >
          <div className="flex items-center justify-center h-full">
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
        </div>
      </div>
    </div>
  )
}

export default SpacedfLogo

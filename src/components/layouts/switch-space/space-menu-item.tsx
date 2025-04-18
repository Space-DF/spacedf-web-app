import { useTranslations } from 'next-intl'
import React, { Suspense } from 'react'
import { OrganizationLogo } from '@/components/icons/organization-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Space } from '@/types/space'

type SpaceMenuItemProps = {
  spaceData: Space
  position: number
}

const SpaceMenuItem = ({ spaceData, position }: SpaceMenuItemProps) => {
  const t = useTranslations('space')
  const { logo, name, total_devices = 0 } = spaceData
  const shortCutText = `⌘⌥${position + 1}`

  return (
    <>
      <div className="flex gap-3">
        <Avatar className="flex items-center justify-center rounded-lg bg-purple-200 dark:bg-purple-700">
          <AvatarImage
            src={logo}
            alt={name}
            className="mix-blend-darken rounded-lg"
          />
          <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
            <OrganizationLogo
              className="text-purple-900 dark:text-purple-400"
              width={28}
              height={28}
            />
          </Suspense>
        </Avatar>

        <div className="flex flex-col justify-between font-medium">
          <p className={cn('text-xs font-medium leading-normal text-white')}>
            {name}
          </p>
          <span className="text-xs font-medium capitalize leading-normal text-brand-dark-text-gray">
            {t('devices', { count: total_devices })}
          </span>
        </div>
      </div>
      <DropdownMenuShortcut className="text-brand-dark-text-gray">
        {shortCutText}
      </DropdownMenuShortcut>
    </>
  )
}

export default SpaceMenuItem

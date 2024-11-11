import { useTranslations } from 'next-intl'
import React, { Suspense } from 'react'
import { OrganizationLogo } from '@/components/icons/organization-logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { TSpace } from '@/types/common'

type SpaceMenuItemProps = {
  spaceData: TSpace
  position: number
}

const SpaceMenuItem = ({ spaceData, position }: SpaceMenuItemProps) => {
  const t = useTranslations('space')
  const { title, count_device = 0 } = spaceData
  const shortCutText = `⌘⌥${position + 1}`

  return (
    <>
      <div className="flex gap-2">
        <Avatar className="flex items-center justify-center rounded-lg bg-purple-200 p-1 dark:bg-purple-700">
          <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
            <OrganizationLogo className="text-purple-900 dark:text-purple-400" />
          </Suspense>
        </Avatar>

        <div className="flex flex-col justify-between font-medium">
          <p className={cn('text-xs font-medium leading-normal text-white')}>
            {title}
          </p>
          <span className="text-xs font-medium capitalize leading-normal text-brand-dark-text-gray">
            {t('devices', { count: count_device })}
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

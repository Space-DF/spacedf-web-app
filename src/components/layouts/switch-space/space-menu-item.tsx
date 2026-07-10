import React, { Suspense } from 'react'
import { OrganizationLogo } from '@/components/icons/organization-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import { Space } from '@/types/space'

type SpaceMenuItemProps = {
  spaceData: Space
  position: number
}

const SpaceMenuItem = ({ spaceData, position }: SpaceMenuItemProps) => {
  const { url_logo, name } = spaceData
  const shortCutText = `⌘⌥${position + 1}`

  return (
    <>
      <div className="flex items-center gap-2">
        <Avatar className="flex size-8 items-center justify-center rounded-[10px] bg-accent">
          <AvatarImage src={url_logo} alt={name} className="size-full" />
          <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
            <OrganizationLogo className="text-primary" width={20} height={20} />
          </Suspense>
        </Avatar>

        <p className="text-[14px] font-medium leading-5 text-popover-foreground">
          {name}
        </p>
      </div>

      <DropdownMenuShortcut className="opacity-0">
        {shortCutText}
      </DropdownMenuShortcut>
    </>
  )
}

export default SpaceMenuItem

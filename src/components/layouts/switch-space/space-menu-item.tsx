import React, { Suspense } from 'react'
import { OrganizationLogo } from '@/components/icons/organization-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Space } from '@/types/space'
import { Lock } from '@/components/icons'

type SpaceMenuItemProps = {
  spaceData: Space
  position: number
}

const SpaceMenuItem = ({ spaceData }: SpaceMenuItemProps) => {
  const { url_logo, name, is_deactivated } = spaceData

  return (
    <div className="flex w-full items-center justify-between gap-2">
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

      {is_deactivated && (
        <span className="size-5 shrink-0 rounded-md justify-center flex items-center border border-brand-component-stroke-warning-soft bg-brand-component-fill-warning-soft">
          <Lock className="text-brand-icon-warning-dark" />
        </span>
      )}
    </div>
  )
}

export default SpaceMenuItem

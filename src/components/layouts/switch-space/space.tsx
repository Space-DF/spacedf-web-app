import React, { Suspense } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { OrganizationLogo } from '@/components/icons/organization-logo'
import { ChevronsUpDown } from 'lucide-react'
import { Space as TSpace } from '@/types/space'

type SpaceProps = {
  spaceData?: TSpace
  isSelected?: boolean
  isCollapsed?: boolean
  hiddenOption?: boolean
}

const Space = ({ spaceData, isSelected, hiddenOption = false }: SpaceProps) => {
  const { url_logo, name } = spaceData || {}

  return (
    <div
      className={cn(
        '[--nest-r:var(--input-radius)]',
        'flex cursor-pointer items-center justify-between gap-2 border border-border p-1 rounded-[var(--nest-r)]',
        {
          'border-border p-px': hiddenOption,
        }
      )}
    >
      <div className="flex gap-2">
        <Avatar
          className={cn(
            'flex items-center justify-center rounded-nested bg-accent',
            {
              'size-7': hiddenOption,
              'p-1': !url_logo,
            }
          )}
        >
          <AvatarImage src={url_logo} alt={name} className="size-full" />
          <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
            <OrganizationLogo className="text-primary" />
          </Suspense>
        </Avatar>
        {!hiddenOption && (
          <div className="flex flex-col items-start justify-center font-medium">
            <p
              className={cn(
                'text-sm font-semibold w-full wrap-anywhere line-clamp-1',
                isSelected ? 'text-foreground dark:text-white' : 'text-white'
              )}
            >
              {name}
            </p>
          </div>
        )}
      </div>
      {!hiddenOption && (
        <ChevronsUpDown size={20} className="text-muted-foreground" />
      )}
    </div>
  )
}

export default Space

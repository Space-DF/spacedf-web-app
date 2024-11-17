import React, { Suspense } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ImageWithBlur from '@/components/ui/image-blur'
import { TSpace } from '@/types/common'
import AvtUser from '/public/images/avt-user.svg'
import { cn } from '@/lib/utils'
import { OrganizationLogo } from '@/components/icons/organization-logo'
import { ChevronsUpDown } from 'lucide-react'

type SpaceProps = {
  spaceData: TSpace
  isSelected?: boolean
  isCollapsed?: boolean
  hiddenOption?: boolean
}

// thumbnail,
//   isSelected,
//   title,
//   count_device,

const Space = ({ spaceData, isSelected, hiddenOption = false }: SpaceProps) => {
  const { thumbnail, title, count_device } = spaceData

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-brand-stroke-dark-soft p-1 dark:border-brand-stroke-outermost',
        {
          'rounded-lg border-brand-component-stroke-secondary p-px':
            hiddenOption,
        },
      )}
    >
      <div className="flex gap-2">
        <Avatar
          className={cn(
            'flex items-center justify-center rounded-lg bg-purple-200 p-1 dark:bg-purple-700',
            {
              'size-7': hiddenOption,
            },
          )}
        >
          <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
            {/* <ImageWithBlur
            src={}
            width={40}
            height={40}
            alt="space-df"
          /> */}
            <OrganizationLogo className="text-purple-900 dark:text-purple-400" />
          </Suspense>
        </Avatar>
        {!hiddenOption && (
          <div className="flex flex-col items-start justify-between font-medium">
            <p
              className={cn(
                'text-sm font-semibold',
                isSelected
                  ? 'text-brand-heading dark:text-white'
                  : 'text-white',
              )}
            >
              {title}
            </p>
            <span className="rounded bg-brand-dark-fill-secondary px-2 text-xs font-semibold leading-normal text-white dark:text-brand-dark-text-gray">
              Admin
            </span>
          </div>
        )}
      </div>
      {!hiddenOption && (
        <ChevronsUpDown size={20} className="text-brand-text-gray" />
      )}
    </div>
  )
}

export default Space

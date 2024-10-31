import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import ImageWithBlur from '@/components/ui/image-blur'
import { cn } from '@/lib/utils'
import { TSpace } from '@/types/common'
import { Suspense } from 'react'
import AvtUser from '/public/images/avt-user.svg'
import { OrganizationLogo } from '@/components/icons/organization-logo'

type SpaceMenuItemProps = {
  spaceData: TSpace
  position: number
}

const SpaceMenuItem = ({ spaceData, position }: SpaceMenuItemProps) => {
  const { thumbnail, title, count_device, id } = spaceData

  const shortCutText = `⌘⌥${position + 1}`

  return (
    <>
      <div className="flex gap-2 p-[2px]">
        <Avatar className="flex items-center justify-center rounded-[12px] bg-purple-200 p-1 dark:bg-purple-700">
          <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
            {/* <ImageWithBlur
              src={thumbnail || AvtUser}
              width={40}
              height={40}
              alt="space-df"
            /> */}
            <OrganizationLogo className="text-purple-900 dark:text-purple-400" />
          </Suspense>
        </Avatar>

        <div className="flex flex-col justify-between font-medium">
          <p className={cn('text-xs')}>{title}</p>
          <span className="text-xs font-medium text-gray-400 dark:text-brand-dark-text-gray">
            {count_device} devices
          </span>
        </div>
      </div>
      <DropdownMenuShortcut>{shortCutText}</DropdownMenuShortcut>
    </>
  )
}

export default SpaceMenuItem

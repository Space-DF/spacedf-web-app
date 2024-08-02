import React, { Suspense } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ImageWithBlur from "@/components/ui/image-blur"
import { TSpace } from "@/types/common"
import AvtUser from "/public/images/avt-user.svg"
import { cn } from "@/lib/utils"
import { OrganizationLogo } from "@/components/icons/organization-logo"

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
    <div className="p-[2px] border border-brand-stroke-dark-soft dark:border-brand-stroke-outermost rounded-[12px] flex gap-2">
      <Avatar className="rounded-[12px] flex items-center justify-center bg-purple-200 dark:bg-purple-700 p-1">
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
        <div className="flex flex-col justify-between font-medium">
          <p
            className={cn(
              "text-xs",
              isSelected ? "text-brand-heading dark:text-white" : "text-white"
            )}
          >
            {title}
          </p>
          <span className="text-xs font-medium text-gray-400 dark:text-brand-dark-text-gray">
            {count_device} devices
          </span>
        </div>
      )}
    </div>
  )
}

export default Space

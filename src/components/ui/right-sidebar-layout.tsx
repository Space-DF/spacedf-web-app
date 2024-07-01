import { PlusIcon } from "@radix-ui/react-icons"
import React, { PropsWithChildren } from "react"

type RightSideBarLayoutProps = {
  onClose?: () => void
  title?: string
  headerButton?: React.ReactNode | string
  allowClose?: boolean
} & PropsWithChildren

export const RightSideBarLayout = ({
  onClose,
  title,
  headerButton,
  allowClose = true,
  children,
}: RightSideBarLayoutProps) => {
  return (
    <div className="p-4">
      <div className="flex gap-2">
        <div className="flex flex-wrap gap-2 duration-300 flex-1 justify-between items-center">
          <p className="text-base text-brand-text-dark font-semibold">
            {title}
          </p>
          {headerButton}
        </div>

        {allowClose && (
          <div
            className="p-2 hover:bg-brand-fill-surface rounded-sm group h-max cursor-pointer"
            onClick={onClose}
          >
            <PlusIcon
              width={24}
              height={24}
              className="rotate-45 group-hover:scale-110 duration-300 group-hover:-rotate-45"
            />
          </div>
        )}
      </div>
      <div className="my-6">{children}</div>
    </div>
  )
}

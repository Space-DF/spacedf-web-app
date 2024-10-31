import { PlusIcon } from '@radix-ui/react-icons'
import React, { PropsWithChildren } from 'react'

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
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2 duration-300">
          <p className="text-base font-semibold text-brand-text-dark dark:text-white">
            {title}
          </p>
          {headerButton}
        </div>

        {allowClose && (
          <div
            className="group h-max cursor-pointer rounded-sm p-2 hover:bg-brand-fill-surface hover:dark:bg-brand-stroke-outermost"
            onClick={onClose}
          >
            <PlusIcon
              width={24}
              height={24}
              className="rotate-45 duration-300 group-hover:-rotate-45 group-hover:scale-110 dark:text-brand-dark-text-gray"
            />
          </div>
        )}
      </div>
      <div className="my-6 dark:text-brand-dark-text-gray">{children}</div>
    </div>
  )
}

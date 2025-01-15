import { PlusIcon } from '@radix-ui/react-icons'
import React, { PropsWithChildren } from 'react'

type RightSideBarLayoutProps = {
  onClose?: () => void
  title?: React.ReactNode | string
  headerButton?: React.ReactNode | string
  externalButton?: React.ReactNode
  allowClose?: boolean
} & PropsWithChildren

export const RightSideBarLayout = ({
  onClose,
  title,
  headerButton,
  allowClose = true,
  children,
  externalButton,
}: RightSideBarLayoutProps) => {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex w-full">
        <div className="flex flex-1 items-center gap-2 pl-4 pr-2 pt-4">
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2 duration-300">
            <p className="text-base font-semibold text-brand-text-dark dark:text-white">
              {title}
            </p>
            {headerButton}
            {externalButton}
          </div>
        </div>
        <div className="flex items-start gap-2 pr-4 pt-4">
          {allowClose && (
            <div
              className="group h-max cursor-pointer rounded-sm p-1 hover:bg-brand-fill-surface hover:dark:bg-brand-stroke-outermost"
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
      </div>
      <div className="flex-1 shrink-0 overflow-hidden dark:text-brand-dark-text-gray">
        {children}
      </div>
    </div>
  )
}

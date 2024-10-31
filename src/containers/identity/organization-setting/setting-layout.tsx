import { Logo } from '@/components/ui/logo'
import {
  TypographyPrimary,
  TypographySecondary,
} from '@/components/ui/typography'
import React, { PropsWithChildren } from 'react'

type SettingLayoutProps = {
  title?: string
  subscription?: string
} & PropsWithChildren

const SettingLayout = ({
  children,
  title,
  subscription,
}: SettingLayoutProps) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-[80%]">
        <div className="mb-4 h-44 w-44">
          <Logo allowAnimation={false} />
        </div>
        {title && (
          <TypographyPrimary className="mb-4 text-3xl font-medium 2xl:mb-6 2xl:text-4xl">
            {title}
          </TypographyPrimary>
        )}
        {subscription && (
          <TypographySecondary className="text-base font-normal 2xl:text-lg">
            {subscription}
          </TypographySecondary>
        )}
        <div className="my-6 2xl:my-8">{children}</div>
      </div>
    </div>
  )
}

export default SettingLayout

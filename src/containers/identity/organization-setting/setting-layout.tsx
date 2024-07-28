import { Logo } from "@/components/ui/logo"
import {
  TypographyPrimary,
  TypographySecondary,
} from "@/components/ui/typography"
import React, { PropsWithChildren } from "react"

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
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[80%]">
        <div className="w-44 h-44 mb-4">
          <Logo allowAnimation={false} />
        </div>
        {title && (
          <TypographyPrimary className="text-3xl 2xl:text-4xl font-medium mb-4 2xl:mb-6">
            {title}
          </TypographyPrimary>
        )}
        {subscription && (
          <TypographySecondary className="text-base 2xl:text-lg font-normal">
            {subscription}
          </TypographySecondary>
        )}
        <div className="my-6 2xl:my-8">{children}</div>
      </div>
    </div>
  )
}

export default SettingLayout

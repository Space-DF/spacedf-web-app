'use client'

import Image from 'next/image'
import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { SUPPORT_EMAIL } from '@/constants'

type AccessRestrictedProps = {
  title: ReactNode
  description: ReactNode
  backHref: string
  backLabel: ReactNode
}

const AccessRestricted = ({
  title,
  description,
  backHref,
  backLabel,
}: AccessRestrictedProps) => {
  const tCommon = useTranslations('common')

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-background-fill-surface p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/access-restricted.svg"
            alt=""
            width={327}
            height={166}
            priority
          />
          <div className="flex h-8 items-center justify-center rounded-[10px] border border-brand-component-stroke-dark-soft bg-brand-component-fill-dark-soft px-3 text-[14px] font-medium leading-5 text-brand-component-text-dark">
            {tCommon('access_restricted')}
          </div>
        </div>

        <div className="flex max-w-[600px] flex-col items-center gap-2 text-center text-brand-component-text-dark">
          <h1 className="text-[32px] font-semibold">{title}</h1>
          <p className="text-[16px] leading-6">{description}</p>
        </div>

        <Button
          asChild
          className="h-12 w-full max-w-[450px] rounded-xl text-[16px] font-semibold"
        >
          <Link href={backHref}>{backLabel}</Link>
        </Button>

        <p className="text-center text-[14px] leading-5">
          <span className="text-brand-component-text-gray">
            {tCommon('need_help_contact_our_support_team_at')}{' '}
          </span>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-brand-component-text-dark"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  )
}

export default AccessRestricted

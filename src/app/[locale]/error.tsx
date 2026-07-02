'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { ADMIN_SITE_URL } from '@/shared/env'
import { useTranslations } from 'next-intl'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('common')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="h-screen flex flex-col items-center justify-center relative">
      <div className="space-y-4 flex flex-col items-center">
        <Image
          src="/images/org-not-exist.svg"
          alt="Something went wrong"
          width={529}
          height={408}
        />
        <div className="space-y-8">
          <div className="flex flex-col space-y-6 text-center">
            <span className="text-brand-component-text-dark font-medium text-4xl">
              {t('oops_something_went_wrong')}
            </span>
            <span className="text-brand-component-text-gray text-lg">
              {t('please_try_again_or_go_back_to_space_df')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 w-full">
            <Button asChild variant="outline" className="border-2 h-12">
              <Link href={ADMIN_SITE_URL}>{t('go_to_space_df')}</Link>
            </Button>
            <Button className="h-12" onClick={reset}>
              {t('try_again')}
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full">
        <div className="w-full text-center mb-4">
          <span className="text-brand-component-text-gray text-sm leading-7 font-normal">
            {t('powered_by')}{' '}
            <span className="text-brand-component-text-dark font-bold">
              SpaceDF
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

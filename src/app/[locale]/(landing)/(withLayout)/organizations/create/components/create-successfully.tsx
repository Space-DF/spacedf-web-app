import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import LoadingFullScreen from '@/components/ui/loading-fullscreen'
import { Link, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export function CreateSuccessfully() {
  const [count, setCount] = React.useState<number>(5)
  const router = useRouter()
  const t = useTranslations('organization')

  useEffect(() => {
    if (count === 0) {
      router.replace('/organizations')
      return
    }

    const intervalId = setInterval(() => {
      setCount((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [count])

  return (
    <div className="fixed inset-0 flex flex-col z-50 bg-brand-fill-surface px-4">
      <div className="bg-brand-background-fill-outermost py-4 flex items-center gap-1 justify-end border-b border-brand-component-stroke-dark-soft">
        <span>{t('go_to_organization_management_after')}</span>
        <div className="bg-brand-component-fill-secondary px-4 py-1 text-white text-[14px] font-semibold leading-5 rounded-full">
          00:0{count}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <LoadingFullScreen className="size-auto" />
        <div className="mt-5 space-y-6 text-center max-w-2xl px-4">
          <div className="text-brand-component-text-dark font-medium text-4xl leading-normal">
            {t('congratulations')}
          </div>
          <div className="text-brand-component-text-gray text-lg">
            {t(
              'youve_created_your_new_organization_you_can_add_your_member_in_the_space_settings'
            )}
          </div>
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="h-12 flex-1 text-[16px] font-semibold"
            >
              <Link href={`/organizations`}>
                {t('go_to_my_organization_management')}
              </Link>
            </Button>
            <Button
              asChild
              className="h-12 flex-1 text-[16px] font-semibold rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark text-brand-component-text-light-fixed shadow-sm dark:border-brand-component-stroke-light"
            >
              <Link href={`/`}>{t('go_to_digital_fortress')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

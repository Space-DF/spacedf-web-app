'use client'

import { Button } from '@/components/ui/button'
import { InputWithIcon } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useGetOrganizations } from './hooks/useGetOrganizations'
import { Nodata } from '@/components/ui'
import { useTranslations } from 'next-intl'
import { OrganizationItem } from './components/organization-item'
import { RootUserLayout } from '@/components/layouts/root-layout'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import LoadingFullScreen from '@/components/ui/loading-fullscreen'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useGlobalStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { useDebounce, usePageTransition } from '@/hooks'
import { SpaceDFLogoFull } from '@/components/icons'
import { useSearch } from '@/contexts/search-organization-context'

export default function OrganizationPage() {
  const t = useTranslations('organization')
  const { duration, resetLoadingState } = useGlobalStore(
    useShallow((state) => state)
  )
  const { startRender } = usePageTransition({ duration: duration || 1000 })
  const { open } = useSearch()
  const refInputSearch = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const searchValue = useDebounce(search, 300)
  const { data: organizations } = useGetOrganizations({ search: searchValue })

  useEffect(() => {
    if (startRender) {
      setTimeout(() => {
        resetLoadingState()
      }, 1000)
    }
  }, [startRender])

  useEffect(() => {
    if (open && refInputSearch.current) {
      refInputSearch.current.focus()
    }
  }, [open])

  return (
    <RootUserLayout>
      <div
        className={cn(
          'absolute inset-0 bg-white transition-all dark:bg-brand-fill-outermost z-10 flex flex-col items-center justify-center',
          { 'animate-hide-effect': startRender }
        )}
      >
        <SpaceDFLogoFull width={300} height={64} className="mb-6" />
        <LoadingFullScreen className="size-auto" />
        <div className="mt-5 space-y-6 text-center">
          <div className="text-brand-component-text-dark font-semibold text-3xl leading-normal">
            {t('hello_welcome_to_digital_fortress')}
          </div>
          <div className="text-brand-component-text-gray text-lg">
            {t('please_wait_a_couple_second')}
          </div>
        </div>
      </div>
      <div className="bg-brand-background-fill-surface pt-6 px-10 pb-16 flex flex-col gap-6 min-h-dvh">
        <div className="flex justify-between items-center">
          <div className="font-bold text-xl text-brand-component-text-dark">
            {t('organization_management')}
          </div>
          <Button asChild>
            <Link href="/organizations/create">{t('add_organization')}</Link>
          </Button>
        </div>
        <div className="h-full flex flex-col gap-4">
          <div>
            <InputWithIcon
              ref={refInputSearch}
              prefixCpn={<Search size={16} />}
              suffixCpn={
                <div className="size-5 text-brand-component-text-gray text-[14px] font-semibold mr-1.5">
                  ⌘K
                </div>
              }
              placeholder={t('search')}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearch(event.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {organizations?.data?.response_data?.results?.length ? (
              organizations?.data?.response_data?.results.map((item) => (
                <OrganizationItem key={item.id} {...item} />
              ))
            ) : (
              <div className="col-span-4">
                <Nodata
                  content={t('you_currently_dont_have_any_organizations')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </RootUserLayout>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useOrganizationStore } from '@/stores/organization-store'
import { Link2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import ImageWithBlur from '@/components/ui/image-blur'
import React, { PropsWithChildren, useState } from 'react'
import { cn } from '@/lib/utils'
import { useCreateOrganization } from '../hooks/useCreateOrganization'
import { useSession } from 'next-auth/react'
import { CreateSuccessfully } from './create-successfully'

export function SelectTemplate() {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('organization')
  const { data: session } = useSession()
  const {
    organizationName,
    organizationSlug,
    organizationTemplate,
    setOrganizationInfo,
    resetOrganizationInfo,
  } = useOrganizationStore()
  const { trigger: createOrganizationMutation, isMutating } =
    useCreateOrganization()

  const templates = [
    {
      value: 'smart_fleet_monitor',
      imgSrc: '/images/org-template/template-1.webp',
      title: t('smart_fleet_monitor'),
      isComingSoon: false,
    },
    {
      value: 'indoor_asset_tracking',
      imgSrc: '/images/org-template/template-2.webp',
      title: t('indoor_asset_tracking'),
      isComingSoon: true,
    },
    {
      value: 'water_pressure_management',
      imgSrc: '/images/org-template/template-3.webp',
      title: t('water_pressure_management'),
      isComingSoon: true,
    },
    {
      value: 'warehouse_tracking',
      imgSrc: '/images/org-template/template-4.webp',
      title: t('warehouse_tracking'),
      isComingSoon: true,
    },
    {
      value: 'coming_soon',
      imgSrc: '/images/org-template/template-2.webp',
      title: t('indoor_asset_tracking'),
      isComingSoon: true,
    },
    {
      value: 'smart_office',
      imgSrc: '/images/org-template/template-6.webp',
      title: t('smart_office'),
      isComingSoon: true,
    },
  ]

  const handleCreateNewOrganization = async () => {
    setLoading(true)
    const res = await createOrganizationMutation({
      payload: {
        name: organizationName,
        logo: 'https://github.com/shadcn.png',
        slug_name: organizationSlug,
        template: organizationTemplate,
      },
      headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
    })

    setTimeout(() => {
      if (res.data) {
        resetOrganizationInfo()
      }
      setLoading(false)
    }, 5000)
  }

  return (
    <>
      <div className="h-full p-6 flex flex-col gap-4">
        <div className="border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-4 rounded-2xl space-y-4">
          <div className="text-brand-component-text-dark font-semibold text-[16px] leading-6">
            {t('information_organization')}
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Avatar className="size-12 rounded-lg">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-brand-typo-display text-[14px] font-semibold leading-5 min-w-44">
                  {t('organization_name')}:
                </div>
                <div className="text-brand-component-text-gray font-medium text-[14px] leading-5">
                  {organizationName}
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-brand-typo-display text-[14px] font-semibold leading-5 min-w-44">
                  {t('organization_slug_name')}:
                </div>
                <div className="text-brand-component-text-gray font-medium text-xs leading-normal bg-brand-component-fill-dark-soft py-1 px-2 rounded flex items-center gap-1">
                  <Link2 size={16} className="-rotate-45" />
                  {organizationSlug}.spacedf.com
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-4 rounded-2xl space-y-6">
          <div className="space-y-4">
            <div className="text-brand-component-text-dark font-semibold text-[16px] leading-6">
              {t('template')}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {templates.map((item) => (
                <TemplateItem
                  isSelected={organizationTemplate === item.value}
                  {...item}
                  key={item.value}
                  onClick={() => {
                    if (item.isComingSoon) return
                    setOrganizationInfo({ organizationTemplate: item.value })
                  }}
                />
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button
              onClick={handleCreateNewOrganization}
              disabled={isMutating}
              loading={isMutating}
              className="h-12 min-w-40 text-[16px] rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark font-semibold text-brand-component-text-light-fixed shadow-sm dark:border-brand-component-stroke-light"
            >
              {t('create_organization')}
            </Button>
          </div>
        </div>
      </div>
      {loading && <CreateSuccessfully />}
    </>
  )
}

interface TemplateItemProps {
  value: string
  imgSrc: string
  title: string
  isSelected: boolean
  isComingSoon: boolean
  onClick: () => void
}

const TemplateItem = (props: PropsWithChildren<TemplateItemProps>) => {
  const t = useTranslations('organization')

  return (
    <div
      className={cn('p-0.5 rounded-lg min-h-60 relative', {
        'border-2 border-transparent before:absolute before:inset-0 before:-m-0.5 before:[border-radius:inherit] before:bg-[linear-gradient(90.37deg,_#6580EB_10.98%,_#9957EC_57.08%,_#B443ED_95.56%)]':
          props.isSelected,
        'cursor-pointer': !props.isComingSoon,
      })}
      key={props.value}
      onClick={props.onClick}
    >
      <div className="p-1.5 rounded-lg h-full bg-brand-component-fill-light z-10 relative">
        <div>
          <ImageWithBlur
            src={props.imgSrc}
            alt={props.title}
            width={184}
            height={127}
            className="object-contain rounded-md"
          />
        </div>
        <div className="text-brand-component-text-dark font-semibold text-[16px] leading-6 mt-2 text-center">
          {props.title}
        </div>
        {props.isComingSoon && (
          <div className="text-[16px] text-brand-component-text-light font-semibold absolute rounded-lg inset-0 bg-[#171A28]/60 backdrop-blur-lg flex items-center justify-center">
            {t('coming_soon')}
          </div>
        )}
      </div>
    </div>
  )
}

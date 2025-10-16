import React from 'react'

import ImageWithBlur from '@/components/ui/image-blur'

import Warehouse from '/public/images/warehouse-tracking.svg'
import SmartOffice from '/public/images/smart-office.svg'
import IndoorTracking from '/public/images/indoor-tracking.svg'
import FleetTracking from '/public/images/fleet-tracking.svg'
import WaterManagement from '/public/images/water-management.svg'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'

const templates = (translateFn: ReturnType<typeof useTranslations>) => [
  {
    href: '/warehouse-tracking',
    title: translateFn('warehouse_tracking'),
    thumbnail: Warehouse,
  },
  {
    href: '/smart-office',
    title: translateFn('smart_office'),
    thumbnail: SmartOffice,
  },
  {
    href: '/indoor-tracking',
    title: translateFn('indoor_asset_tracking'),
    thumbnail: IndoorTracking,
  },
  {
    href: '/fleet-tracking',
    title: translateFn('fleet_tracking'),
    thumbnail: FleetTracking,
  },
  {
    href: '/water-management',
    title: translateFn('water_pressure_management'),
    thumbnail: WaterManagement,
  },
]

const SelectTemplate = () => {
  const t = useTranslations('onboarding')
  return (
    <div className="w-full">
      <div className="mb-6 text-center text-2xl font-medium text-brand-heading dark:text-white">
        {t('you_can_get_started_with_template')}
      </div>
      <div className="mb-8 flex flex-wrap justify-center gap-6 duration-300">
        {templates(t).map((template) => (
          <Template {...template} key={template.href} />
        ))}
      </div>
    </div>
  )
}

const Template = ({
  href,
  title,
  thumbnail,
}: ReturnType<typeof templates>[number]) => {
  const router = useRouter()
  return (
    <div className="group min-h-36 min-w-36 flex-shrink cursor-pointer rounded-lg bg-white p-2 transition-all duration-300 hover:shadow-lg dark:bg-brand-stroke-outermost sm:w-[30%]">
      <div className="flex h-full w-full flex-col gap-2">
        <div className="min-h-2/3 w-full">
          <ImageWithBlur
            src={thumbnail}
            className="h-full w-full object-cover duration-300 group-hover:scale-125"
            alt={title}
            onClick={() => router.push(href)}
          />
        </div>
        <div className="m-auto h-1/3 max-w-[80%] text-center text-sm font-semibold text-brand-component-text-dark duration-200 dark:text-white">
          {title}
        </div>
      </div>
    </div>
  )
}

export default SelectTemplate

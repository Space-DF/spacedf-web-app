'use client'

import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import { CreateOrganization } from './components/create-organization'
import { SelectTemplate } from './components/select-template'
import { useOrganizationStore } from '@/stores/organization-store'
import { useRouter } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import React from 'react'
import PreviewDomain from '@/containers/identity/organization-setting/preview-domain'

export default function OrganizationPage() {
  const router = useRouter()
  const t = useTranslations('organization')
  const { step, setStep, resetOrganizationInfo } = useOrganizationStore()

  const steps = {
    create: {
      label: t('create_new_organization'),
      component: <CreateOrganization />,
    },
    template: {
      label: t('select_template'),
      component: <SelectTemplate />,
    },
  }

  const handleBack = () => {
    if (step === 'create') {
      resetOrganizationInfo()
      router.replace('/organizations')
      return
    }
    setStep('create')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="relative py-4 flex justify-center border-b border-brand-component-stroke-dark-soft">
        <div className="flex items-center gap-1 absolute left-4 top-1/2 -translate-y-1/2">
          <ArrowLeft
            onClick={handleBack}
            size={20}
            className="text-brand-icon-gray cursor-pointer"
          />
          <span className="leading-6 text-[16px] font-semibold">
            {steps[step].label}
          </span>
        </div>
        <div className="bg-brand-component-fill-secondary px-4 py-1 text-white text-[14px] font-semibold leading-5 rounded-full">
          {t('steps', { count: Object.keys(steps).indexOf(step) + 1 })}
        </div>
      </div>
      <div
        className={cn('py-4 px-10 flex-1 flex flex-col', {
          'bg-brand-background-fill-surface': step === 'template',
        })}
      >
        <div className="flex flex-1">
          <div className="flex-1">{steps[step].component}</div>
          <div className="flex-1 overflow-hidden">
            <PreviewDomain />
          </div>
        </div>
      </div>
    </div>
  )
}

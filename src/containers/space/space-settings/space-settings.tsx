'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SpaceDelete } from './space-delete'
import { SpaceInformation } from './space-information'
import { useSpaceSettings } from '@/stores/space-settings-store'

type Step = 'information' | 'delete'

export function SpaceSettings() {
  const t = useTranslations()
  const { step } = useSpaceSettings()

  const steps: Record<Step, { component: React.ReactNode }> = {
    information: {
      component: <SpaceInformation />,
    },
    delete: {
      component: <SpaceDelete />,
    },
  }

  return (
    <div className="relative flex w-1/2 flex-1 flex-col overflow-hidden bg-brand-background-fill-outermost">
      {steps[step].component}
    </div>
  )
}

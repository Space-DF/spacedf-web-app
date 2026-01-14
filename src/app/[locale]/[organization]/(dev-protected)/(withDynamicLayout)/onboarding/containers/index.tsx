'use client'

import { MagicWand } from '@/components/icons/magic-wand'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useLayout } from '@/stores'
import { displayedRightDynamicLayout, getDynamicLayoutRight } from '@/utils'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import SelectTemplate from './SelectTemplate'

const OnboardingContainer = () => {
  const t = useTranslations('onboarding')
  const commonTranslate = useTranslations('common')
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))

  const rightDynamicLayout = getDynamicLayoutRight(dynamicLayouts)

  const { isShowAll } = displayedRightDynamicLayout(rightDynamicLayout)

  return (
    <div className="mt-8 flex w-full justify-center">
      <div
        className={cn(
          'flex flex-1 flex-col items-center text-wrap duration-300',
          isShowAll ? 'px-4' : 'max-w-xl'
        )}
      >
        <p className="text-center text-4xl font-medium text-brand-heading dark:text-white">
          {t('welcome_title')}
        </p>

        <div className="mt-6 text-center">
          <Button size="xl">
            <div className="flex items-center gap-2">
              {t('create_3d_from_2d')} <MagicWand />
            </div>
          </Button>
          <p className="mt-2 text-center text-[13px] text-brand-text-gray">
            <span className="font-semibold text-brand-component-text-dark dark:text-brand-stroke-outermost">
              {t('click_to_upload')}
            </span>{' '}
            {commonTranslate('or')} {t('drag_drop')}
          </p>
          <p className="text-center text-[13px] font-normal text-brand-text-gray dark:text-brand-dark-text-gray">
            SVG, PTS, DWF, CDR, SKP, XCF, DWG, DXF {commonTranslate('or')} AI (
            {commonTranslate('max')}. 300 MB)
          </p>
        </div>

        <Separator
          orientation="horizontal"
          className="my-[72px] w-[70%] bg-brand-stroke-dark-soft"
        />

        <SelectTemplate />
      </div>
    </div>
  )
}

export default memo(OnboardingContainer)

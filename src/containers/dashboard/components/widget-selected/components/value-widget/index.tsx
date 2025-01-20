import React, { useMemo } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import TabWidget, { TabKey } from '../tab-widget'
import { RightSideBarLayout } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import {
  defaultValueWidgetValues,
  ValuePayload,
  valueSchema,
} from '@/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import Timeframe from './components/timeframe'
import WidgetInfo from './components/widget-info'
import { brandColors } from '@/configs'

const TabContents = () => {
  return (
    <>
      <TabsContent
        value={TabKey.Sources}
        className="mt-4 flex-1 overflow-y-scroll px-4"
      >
        Source
      </TabsContent>
      <TabsContent value={TabKey.Info} className="mt-4 px-4">
        <WidgetInfo />
      </TabsContent>
      <TabsContent value={TabKey.TimeFrame} className="mt-4 px-4">
        <Timeframe />
      </TabsContent>
    </>
  )
}

interface Props {
  onClose: () => void
  onBack: () => void
}

const ValueWidget: React.FC<Props> = ({ onBack, onClose }) => {
  const t = useTranslations('dashboard')
  const form = useForm<ValuePayload>({
    resolver: zodResolver(valueSchema),
    defaultValues: defaultValueWidgetValues,
    mode: 'onChange',
  })

  const { control, trigger } = form

  const value = 0

  const [decimal, widgetName, color] = useWatch({
    control,
    name: ['source.decimal', 'widget_info.name', 'widget_info.color'],
  })

  const currentColor = useMemo(
    () =>
      color === 'default'
        ? brandColors['component-fill-default-chart']
        : `#${color}`,
    [color]
  )

  const handleSaveValueWidget = async () => {
    await trigger()
  }

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onBack} />
          <div>{t(`add_chart_widget`)}</div>
        </div>
      }
      externalButton={
        <Button onClick={handleSaveValueWidget}>{t('save')}</Button>
      }
      onClose={onClose}
    >
      <div className="flex size-full flex-col">
        <div className="h-fit p-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-component-text-dark">
              {t('preview')}
            </p>
            <div className="rounded-lg bg-brand-component-fill-gray-soft p-2">
              <div className="space-y-3 rounded-md bg-brand-background-fill-outermost p-3">
                <div>
                  <div className="h-5">
                    <p className="truncate font-semibold text-brand-component-text-dark">
                      {widgetName}
                    </p>
                  </div>

                  <p className="text-[12px] text-brand-text-gray">
                    {t('no_data')}
                  </p>
                </div>
                <div className="grid grid-cols-1 space-y-6">
                  <span
                    className="text-brand-component-text-dark text-4xl font-semibold"
                    style={{ color: currentColor }}
                  >
                    {value.toFixed(decimal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FormProvider {...form}>
          <TabWidget
            tabKeys={['sources', 'info', 'timeframe']}
            tabContents={<TabContents />}
          />
        </FormProvider>
      </div>
    </RightSideBarLayout>
  )
}

export default ValueWidget

import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { WidgetType } from '@/widget-models/widget'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useMemo } from 'react'
import TabWidget, { TabKey } from '../tab-widget'
import { PreviewChart, dailyOrders } from './components/preview-chart'
import { FormProvider, useForm } from 'react-hook-form'
import {
  defaultSourceChartValues,
  SourceChartPayload,
  sourceChartSchema,
} from '@/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { TabsContent } from '@/components/ui/tabs'
import ChartSource from './components/sources'
import ChartWidgetInfo from './components/widget-info'

interface Props {
  selectedWidget: WidgetType
  onClose: () => void
}

const chartTabKeys = [
  TabKey.Sources,
  TabKey.Info,
  TabKey.Axes,
  TabKey.TimeFrame,
]

const TabContents = () => {
  return (
    <>
      <TabsContent
        value={TabKey.Sources}
        className="flex-1 overflow-y-scroll px-4"
      >
        <ChartSource />
      </TabsContent>
      <TabsContent value={TabKey.Info} className="mt-4 p-4">
        <ChartWidgetInfo />
      </TabsContent>
      <TabsContent value={TabKey.Axes} className="mt-4 p-4">
        <p>Axes</p>
      </TabsContent>
      <TabsContent value={TabKey.TimeFrame} className="mt-4 p-4">
        <p>Content for Timeframe</p>
      </TabsContent>
    </>
  )
}

const ChartWidget: React.FC<Props> = ({ selectedWidget, onClose }) => {
  const t = useTranslations('dashboard')
  const form = useForm<SourceChartPayload>({
    resolver: zodResolver(sourceChartSchema),
    defaultValues: {
      sources: defaultSourceChartValues,
      widget_info: {
        name: 'New chart widget',
        appearance: {
          show_value: true,
        },
      },
    },
    mode: 'onChange',
  })

  const sourcesData = form.watch('sources')

  const isSingleSource = sourcesData.length === 1

  const widgetName = form.watch('widget_info.name')

  const showData = form.watch('widget_info.appearance.show_value')

  const handleSaveForm = async () => {
    const isValid = await form.trigger()
    if (!isValid) return
  }

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onClose} />
          <div>{t(`add_chart_widget`)}</div>
        </div>
      }
      externalButton={<Button onClick={handleSaveForm}>{t('save')}</Button>}
      onClose={onClose}
    >
      <div className="flex size-full flex-col">
        <div className="h-fit p-4">
          <div className="gap-y-2">
            <p className="text-xs font-semibold">{t('preview')}</p>
            <div className="rounded-lg bg-brand-component-fill-gray-soft p-2">
              <div className="space-y-3 rounded-md bg-brand-background-fill-outermost p-3">
                <p className="truncate font-semibold text-brand-component-text-dark">
                  {widgetName}
                </p>
                <div className="grid grid-cols-1">
                  {sourcesData.length === 1 && (
                    <p className="text-lg font-bold">
                      {dailyOrders.at(-1)?.['source.0']}
                      {sourcesData[0].field === '1' ? '°C' : 'ml'}
                    </p>
                  )}
                  <PreviewChart
                    sources={sourcesData}
                    isSingleSource={isSingleSource}
                    showData={showData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <FormProvider {...form}>
          <TabWidget tabKeys={chartTabKeys} tabContents={<TabContents />} />
        </FormProvider>
      </div>
    </RightSideBarLayout>
  )
}

export default memo(ChartWidget)

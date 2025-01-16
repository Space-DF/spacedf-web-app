import React from 'react'
import PreviewChart from './components/preview-chart'
import { TabsContent } from '@/components/ui/tabs'
import TabWidget, { TabKey } from '../tab-widget'
import { RightSideBarLayout } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { GaugeType } from '@/widget-models/gauge'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { GaugePayload, gaugeSchema } from '@/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import Source from './components/source'

const TabContents = () => {
  return (
    <>
      <TabsContent
        value={TabKey.Sources}
        className="mt-4 flex-1 overflow-y-scroll px-4"
      >
        <Source />
      </TabsContent>
      <TabsContent value={TabKey.Info} className="mt-4 px-4">
        ChartWidgetInfo
      </TabsContent>
      <TabsContent value={TabKey.TimeFrame} className="mt-4 px-4">
        TimeFrame
      </TabsContent>
    </>
  )
}

interface Props {
  onClose: () => void
}

const GaugeWidget: React.FC<Props> = ({ onClose }) => {
  const t = useTranslations('dashboard')
  const form = useForm<GaugePayload>({
    resolver: zodResolver(gaugeSchema),
  })

  const { control } = form

  const type = useWatch({
    control,
    name: 'source.type',
  }) as GaugeType

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onClose} />
          <div>{t(`add_chart_widget`)}</div>
        </div>
      }
      externalButton={<Button>{t('save')}</Button>}
      onClose={onClose}
    >
      <div className="flex size-full flex-col">
        <div className="h-fit p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-component-text-dark">
              {t('preview')}
            </p>
            <div className="rounded-lg bg-brand-component-fill-gray-soft p-2">
              <div className="space-y-3 rounded-md bg-brand-background-fill-outermost p-3">
                <p className="truncate font-semibold text-brand-component-text-dark">
                  New Gauge Widget
                </p>
                <div className="grid grid-cols-1">
                  <PreviewChart type={type} />
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

export default GaugeWidget

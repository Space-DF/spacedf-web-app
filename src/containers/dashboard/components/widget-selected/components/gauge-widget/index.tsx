import React from 'react'
import { TabsContent } from '@/components/ui/tabs'
import TabWidget, { TabKey } from '../tab-widget'
import { RightSideBarLayout } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { GaugeType } from '@/widget-models/gauge'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { defaultGaugeValues, GaugePayload, gaugeSchema } from '@/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import Source from './components/source'
import TimeFrame from './components/time-frame'
import PreviewGauge from './components/preview-gauge'

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
        <TimeFrame />
      </TabsContent>
    </>
  )
}

interface Props {
  onClose: () => void
  onBack: () => void
}

const GaugeWidget: React.FC<Props> = ({ onClose, onBack }) => {
  const t = useTranslations('dashboard')
  const form = useForm<GaugePayload>({
    resolver: zodResolver(gaugeSchema),
    defaultValues: defaultGaugeValues,
    mode: 'onChange',
  })

  const { control, trigger } = form

  const [type, decimal, unit, min, max, values] = useWatch({
    control,
    name: [
      'source.type',
      'source.decimal',
      'source.unit',
      'source.min',
      'source.max',
      'source.values',
    ],
  })

  const handleSaveGauge = async () => {
    const isValid = await trigger()
    if (!isValid) return
  }

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onBack} />
          <div>{t(`add_gauge_widget`)}</div>
        </div>
      }
      externalButton={<Button onClick={handleSaveGauge}>{t('save')}</Button>}
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
                  <PreviewGauge
                    type={type as GaugeType}
                    decimal={+decimal}
                    unit={unit}
                    min={min}
                    max={max}
                    values={values}
                  />
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

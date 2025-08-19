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
import WidgetInfo from './components/widget-info'
import TimeFrame from './components/time-frame'
import PreviewGauge from './components/preview-gauge'
import { WidgetType } from '@/widget-models/widget'
import { v4 as uuidv4 } from 'uuid'
import { useCreateWidget } from '@/app/[locale]/[organization]/(withAuth)/test-api/hooks/useCreateWidget'
import { toast } from 'sonner'

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
        <WidgetInfo />
      </TabsContent>
      <TabsContent value={TabKey.TimeFrame} className="mt-4 px-4">
        <TimeFrame />
      </TabsContent>
    </>
  )
}

interface Props {
  selectedWidget: WidgetType
  onSaveWidget: () => void
  onBack: () => void
  onClose: () => void
}

const GaugeWidget: React.FC<Props> = ({
  selectedWidget,
  onSaveWidget,
  onClose,
  onBack,
}) => {
  const t = useTranslations('dashboard')
  const form = useForm<GaugePayload>({
    resolver: zodResolver(gaugeSchema),
    defaultValues: defaultGaugeValues,
    mode: 'onChange',
  })

  const { control } = form

  const gaugeValue = form.getValues()

  const [type, decimal, unit, min, max, values, widgetName, showValue] =
    useWatch({
      control,
      name: [
        'source.type',
        'source.decimal',
        'source.unit',
        'source.min',
        'source.max',
        'source.values',
        'widget_info.name',
        'widget_info.appearance.show_value',
      ],
    })

  const { createWidget } = useCreateWidget({
    onSuccess: () => {
      toast.success('Created gauge widget successfully')
      onSaveWidget()
    },
    onError: (error) => {
      const errors = JSON.parse(error.message)

      const isSlugError = 'slug_name' in errors

      if (!isSlugError) {
        toast.error(errors.detail || 'Something went wrong')
      } else {
        toast(
          <ul className="space-y-1 font-medium text-brand-semantic-accent-300">
            {errors.slug_name.map((error: string) => (
              <li key={error} className="capitalize">
                {error}
              </li>
            ))}
          </ul>
        )
      }
    },
  })

  const handleAddGaugeWidget = async () => {
    const isValid = await form.trigger()
    if (!isValid) return
    const newId = uuidv4()
    const newWidgetData = {
      ...gaugeValue,
      id: newId,
      widget_type: selectedWidget,
      widget_size: {
        i: newId,
        x: 0,
        y: 0,
        w: 3,
        h: 3,
        minH: 3,
        minW: 3,
      },
    }
    createWidget(newWidgetData)
  }

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onBack} />
          <div>{t(`add_gauge_widget`)}</div>
        </div>
      }
      externalButton={
        <Button onClick={handleAddGaugeWidget}>{t('save')}</Button>
      }
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
                <div className="h-3">
                  <p className="truncate font-semibold text-brand-component-text-dark">
                    {widgetName}
                  </p>
                </div>
                <div className="grid grid-cols-1">
                  <PreviewGauge
                    type={type as GaugeType}
                    decimal={+decimal}
                    unit={unit}
                    min={min}
                    max={max}
                    values={values}
                    showValue={showValue}
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

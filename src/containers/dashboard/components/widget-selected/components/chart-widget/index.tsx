import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { WidgetType } from '@/widget-models/widget'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import TabWidget, { TabKey } from '../tab-widget'

import { TabsContent } from '@/components/ui/tabs'
import { TimeFormat } from '@/constants'
import { ChartPayload, chartSchema, defaultChartValues } from '@/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import Axes from './components/axes'
import { PreviewChart, dailyOrders } from './components/preview-chart'
import ChartSource from './components/sources'
import TimeFrame from './components/time-frame'
import ChartWidgetInfo from './components/widget-info'
import { useCreateWidget } from '@/app/[locale]/[organization]/(withAuth)/test-api/hooks/useCreateWidget'
import { v4 as uuidv4 } from 'uuid'
import { useScreenLayoutStore } from '@/stores/dashboard-layout'
import { useGetWidgets } from '@/app/[locale]/[organization]/(withAuth)/test-api/hooks/useGetWidget'
import { toast } from 'sonner'

interface Props {
  selectedWidget: WidgetType
  onSaveWidget: () => void
  onBack: () => void
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
        className="mt-4 flex-1 overflow-y-scroll px-4"
      >
        <ChartSource />
      </TabsContent>
      <TabsContent value={TabKey.Info} className="mt-4 px-4">
        <ChartWidgetInfo />
      </TabsContent>
      <TabsContent value={TabKey.Axes} className="mt-4 px-4">
        <Axes />
      </TabsContent>
      <TabsContent value={TabKey.TimeFrame} className="mt-4 px-4">
        <TimeFrame />
      </TabsContent>
    </>
  )
}

const ChartWidget: React.FC<Props> = ({
  selectedWidget,
  onSaveWidget,
  onClose,
  onBack,
}) => {
  const t = useTranslations('dashboard')
  const { mutate } = useGetWidgets()
  const form = useForm<ChartPayload>({
    resolver: zodResolver(chartSchema),
    defaultValues: defaultChartValues,
    mode: 'onChange',
  })

  const { addWidget } = useScreenLayoutStore((state) => ({
    addWidget: state.addWidget,
    setLayouts: state.setLayouts,
    layouts: state.layouts,
  }))

  const { createWidget } = useCreateWidget({
    onSuccess: (newWidget) => {
      mutate((prevData: any) => {
        const newData = [...prevData, newWidget]
        return newData
      }, false)
      const newWidgetLayout = {
        i: newWidget.id,
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        minH: 2,
        minW: 3,
      }
      toast.success('Created chart widget successfully')
      addWidget(newWidgetLayout)
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

  const { control } = form

  const chartValue = form.getValues()

  const sourcesData = useWatch({
    control,
    name: 'sources',
  })
  const isSingleSource = sourcesData.length === 1

  const widgetName = useWatch({ control, name: 'widget_info.name' })

  const [showData, orientation, unit, hideAxis, showXGrid, format] = useWatch({
    control,
    name: [
      'widget_info.appearance.show_value',
      'axes.y_axis.orientation',
      'axes.y_axis.unit',
      'axes.hide_axis',
      'axes.is_show_grid',
      'axes.format',
    ],
  })
  const handleAddChartWidget = async () => {
    const isValid = await form.trigger()
    if (!isValid) return
    const newId = uuidv4()
    const newWidgetData = {
      ...chartValue,
      id: newId,
      widget_type: selectedWidget,
    }
    createWidget(newWidgetData)
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
        <Button onClick={handleAddChartWidget}>{t('save')}</Button>
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
                <p className="truncate font-semibold text-brand-component-text-dark">
                  {widgetName}
                </p>
                <div className="grid grid-cols-1">
                  {sourcesData.length === 1 && (
                    <p className="truncate text-lg font-bold">
                      {`${dailyOrders.at(-1)?.['source.0']} ${unit}`}
                    </p>
                  )}
                  <PreviewChart
                    sources={sourcesData}
                    isSingleSource={isSingleSource}
                    showData={showData}
                    orientation={orientation}
                    hideAxis={hideAxis}
                    showXGrid={showXGrid}
                    format={format as TimeFormat}
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

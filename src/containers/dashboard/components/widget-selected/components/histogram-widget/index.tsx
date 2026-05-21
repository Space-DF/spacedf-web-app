import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { TimeFrameTab, WidgetType } from '@/widget-models/widget'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useEffect } from 'react'
import TabWidget, { TabKey } from '../tab-widget'
import { TabsContent } from '@/components/ui/tabs'
import { TimeFormat } from '@/constants'
import {
  ChartPayload,
  defaultHistogramValues,
  histogramSchema,
} from '@/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import Axes from './components/axes'
import { PreviewChart } from './components/preview-chart'
import ChartSource from './components/sources'
import TimeFrame from './components/time-frame'
import ChartWidgetInfo from './components/widget-info'
import { useCreateWidget } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/test-api/hooks/useCreateWidget'
import { useUpdateWidgets } from '@/containers/dashboard/components/widget-list/hooks/useUpdateWidgets'
import { mergeFormDefaults } from '@/containers/dashboard/components/widget-selected/utils/merge-configuration'
import { WidgetLayout } from '@/types/widget'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { useShowDummyData } from '@/hooks/useShowDummyData'
import {
  dailyOrders,
  generateData,
} from '../chart-widget/components/preview-chart'
import dayjs from 'dayjs'

interface Props {
  selectedWidget: WidgetType
  editingWidgetLayout?: WidgetLayout | null
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

const HistogramWidget: React.FC<Props> = ({
  selectedWidget,
  editingWidgetLayout,
  onSaveWidget,
  onClose,
  onBack,
}) => {
  const t = useTranslations('dashboard')
  const form = useForm<ChartPayload>({
    resolver: zodResolver(histogramSchema),
    defaultValues: defaultHistogramValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (!editingWidgetLayout?.configuration) return
    const cfg = editingWidgetLayout.configuration as unknown as Record<
      string,
      unknown
    >
    const merged = mergeFormDefaults(defaultHistogramValues, cfg)
    form.reset(merged)
  }, [editingWidgetLayout?.id, form])

  const { createWidget, isMutating } = useCreateWidget({
    onSuccess: () => {
      toast.success('Created chart widget successfully')
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

  const { trigger: updateWidgets, isMutating: isUpdatingWidgets } =
    useUpdateWidgets()

  const { control } = form

  const [
    showData,
    orientation,
    unit,
    hideAxis,
    showXGrid,
    format,
    widgetName,
    sourcesData,
  ] = useWatch({
    control,
    name: [
      'widget_info.appearance.show_value',
      'axes.y_axis.orientation',
      'axes.y_axis.unit',
      'axes.hide_axis',
      'axes.is_show_grid',
      'axes.format',
      'widget_info.name',
      'sources',
    ],
  })

  const isSingleSource = sourcesData.length === 1

  const showDummyData = useShowDummyData()

  const handleSaveHistogramWidget = async () => {
    const isValid = await form.trigger()
    if (!isValid) return
    const values = form.getValues()

    if (editingWidgetLayout) {
      const prev = editingWidgetLayout.configuration
      const newConfiguration = {
        ...prev,
        ...values,
        ...(values.timeframe?.type !== TimeFrameTab.Custom
          ? { period: values.timeframe?.type }
          : {
              start_time: dayjs(values.timeframe?.from).format('YYYY-MM-DD'),
              end_time: dayjs(values.timeframe?.until).format('YYYY-MM-DD'),
            }),
      }
      updateWidgets(
        [{ id: editingWidgetLayout.id, configuration: newConfiguration }],
        {
          onSuccess: () => {
            toast.success(t('widgets_updated_successfully'))
            onSaveWidget()
          },
          onError: () => {
            toast.error(t('widgets_update_failed'))
          },
        }
      )
      return
    }

    const newWidgetData = {
      display_type: 'histogram',
      entity_id: values.sources[0].entity_id,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      configuration: {
        ...values,
        ...(values.timeframe?.type !== TimeFrameTab.Custom
          ? {
              period: values.timeframe?.type,
            }
          : {
              start_time: dayjs(values.timeframe?.from).format('YYYY-MM-DD'),
              end_time: dayjs(values.timeframe?.until).format('YYYY-MM-DD'),
            }),
        id: uuidv4(),
        type: selectedWidget,
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        minH: 2,
        minW: 3,
      },
    }
    createWidget(newWidgetData)
  }

  const lastOrderValue = showDummyData ? dailyOrders.at(-1)?.['source.0'] : 0

  const data = generateData(
    (format as TimeFormat) || TimeFormat.FULL_DATE_MONTH_YEAR
  )

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onBack} />
          <div>
            {t(
              editingWidgetLayout
                ? 'edit_histogram_widget'
                : 'add_histogram_widget'
            )}
          </div>
        </div>
      }
      externalButton={
        <Button
          onClick={handleSaveHistogramWidget}
          loading={isMutating || isUpdatingWidgets}
        >
          {t('save')}
        </Button>
      }
      onClose={onClose}
      contentClassName="px-0"
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
                  {widgetName} {unit ? `(${unit})` : ''}
                </p>
                <div className="grid grid-cols-1">
                  {sourcesData.length === 1 && (
                    <p className="truncate text-lg font-bold">
                      {`${lastOrderValue}`}
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
                    data={data}
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

export default memo(HistogramWidget)

import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { WidgetType } from '@/widget-models/widget'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import TabWidget, { TabKey } from '../tab-widget'
import { TabsContent } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useCreateWidget } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/test-api/hooks/useCreateWidget'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import SliderSource from './components/source'
import { defaultSliderValues, sliderSchema, SliderPayload } from '@/validator'
import SliderWidgetInfo from './components/widget-info'
import SliderPreview from './components/preview'

interface Props {
  selectedWidget: WidgetType
  onSaveWidget: () => void
  onBack: () => void
  onClose: () => void
}

const chartTabKeys = [TabKey.Sources, TabKey.Info]

const TabContents = () => {
  return (
    <>
      <TabsContent
        value={TabKey.Sources}
        className="mt-4 flex-1 overflow-y-scroll px-4"
      >
        <SliderSource />
      </TabsContent>
      <TabsContent value={TabKey.Info} className="mt-4 px-4">
        <SliderWidgetInfo />
      </TabsContent>
    </>
  )
}

const SliderWidget: React.FC<Props> = ({
  selectedWidget,
  onSaveWidget,
  onClose,
  onBack,
}) => {
  const t = useTranslations('dashboard')
  const form = useForm<SliderPayload>({
    resolver: zodResolver(sliderSchema),
    defaultValues: defaultSliderValues,
    mode: 'onChange',
  })

  const { createWidget, isMutating } = useCreateWidget({
    onSuccess: () => {
      toast.success('Created chart widget successfully')
      onSaveWidget()
    },
    onError: (error) => {
      const errors = JSON.parse(error.message)
      toast.error(errors.detail || 'Something went wrong')
    },
  })

  const [widgetName, unit] = useWatch({
    control: form.control,
    name: ['widget_info.name', 'source.unit'],
  })

  const handleAddWidget = async () => {
    const isValid = await form.trigger()
    if (!isValid) return
    const sliderValue = form.getValues()
    const newWidgetData = {
      display_type: 'slider',
      entity_id: sliderValue.source?.entity_id,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      configuration: {
        ...sliderValue,
        id: uuidv4(),
        type: selectedWidget,
        x: 0,
        y: 0,
        w: 3,
        h: 2,
        minH: 2,
        minW: 3,
      },
    }
    createWidget(newWidgetData)
  }

  const data = 65

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onBack} />
          <div>{t(`add_slider_widget`)}</div>
        </div>
      }
      externalButton={
        <Button onClick={handleAddWidget} loading={isMutating}>
          {t('save')}
        </Button>
      }
      onClose={onClose}
      contentClassName="px-0"
    >
      <FormProvider {...form}>
        <div className="flex size-full flex-col">
          <div className="h-fit p-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-brand-component-text-dark">
                {t('preview')}
              </p>
              <div className="rounded-lg bg-brand-component-fill-gray-soft p-2">
                <div className="space-y-3 rounded-md bg-brand-background-fill-outermost p-3">
                  <div className="w-full flex flex-col space-y-3">
                    <div className="w-full justify-between flex h-7">
                      <p className="truncate font-semibold text-brand-component-text-dark">
                        {widgetName}
                      </p>
                      <p className="truncate font-semibold text-brand-component-text-dark max-w-8">
                        {unit}
                      </p>
                    </div>
                    <SliderPreview data={data} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TabWidget tabKeys={chartTabKeys} tabContents={<TabContents />} />
        </div>
      </FormProvider>
    </RightSideBarLayout>
  )
}

export default memo(SliderWidget)

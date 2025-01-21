import React, { memo } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Source from './components/map-source'
import TabWidget, { TabKey } from '../tab-widget'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RightSideBarLayout } from '@/components/ui'
import { WidgetType } from '@/widget-models/widget'
import MapPreview from './components/map-preview'
import TableWidgetInfo from './components/widget-info'
import { defaultMapValues, mapPayload, mapSchema } from '@/validator'
import { useCreateWidget } from '@/app/[locale]/[organization]/(withAuth)/test-api/hooks/useCreateWidget'
import { v4 as uuidv4 } from 'uuid'
import { useScreenLayoutStore } from '@/stores/dashboard-layout'

const TABLE_TABS_KEY = [TabKey.Sources, TabKey.Info]

const TabContents = () => {
  return (
    <>
      <TabsContent value={TabKey.Sources}>
        <Source />
      </TabsContent>
      <TabsContent value={TabKey.Info}>
        <TableWidgetInfo />
      </TabsContent>
    </>
  )
}

interface Props {
  selectedWidget: WidgetType
  onClose: () => void
  onBack: () => void
}

const TableWidget: React.FC<Props> = ({ selectedWidget, onClose, onBack }) => {
  const { createWidget } = useCreateWidget()
  const t = useTranslations('dashboard')
  const form = useForm<mapPayload>({
    resolver: zodResolver(mapSchema),
    defaultValues: defaultMapValues,
    mode: 'onChange',
  })
  const { addWidget } = useScreenLayoutStore((state) => ({
    addWidget: state.addWidget,
    setLayouts: state.setLayouts,
    layouts: state.layouts,
  }))

  const { control, trigger } = form

  const mapValue = form.getValues()

  const [source, widget_info] = useWatch({
    control,
    name: ['sources.0', 'widget_info'],
  })

  const handleAddMapWidget = async () => {
    await trigger()
    const newId = uuidv4()
    const newWidgetData = {
      ...mapValue,
      id: newId,
      widget_type: selectedWidget,
    }

    createWidget(newWidgetData)
      .then(() => {
        const newWidget = { i: newId, x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 }
        addWidget(newWidget)
      })
      .catch((error) => {
        console.error('Failed to add widget:', error)
      })
  }

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onBack} />
          <div>{t('add_map_widget')}</div>
        </div>
      }
      externalButton={<Button onClick={handleAddMapWidget}>{t('save')}</Button>}
      onClose={onClose}
    >
      <div className="flex size-full flex-col">
        <div className="h-fit p-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-component-text-dark">
              {t('preview')}
            </p>
            <div className="rounded-lg bg-brand-component-fill-gray-soft p-2 text-sm">
              <div className="rounded-t-md bg-brand-component-fill-light-fixed px-2 pb-1 pt-3 font-semibold text-brand-component-text-dark dark:bg-brand-heading">
                <p
                  className={`max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap ${!widget_info.name && 'text-brand-fill-gray-light'}`}
                >
                  {widget_info.name || t('enter_widget_name')}
                </p>
              </div>
              <div className="p-2 bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                <MapPreview source={source} />
              </div>
            </div>
          </div>
        </div>
        <FormProvider {...form}>
          <TabWidget tabKeys={TABLE_TABS_KEY} tabContents={<TabContents />} />
        </FormProvider>
      </div>
    </RightSideBarLayout>
  )
}

export default memo(TableWidget)

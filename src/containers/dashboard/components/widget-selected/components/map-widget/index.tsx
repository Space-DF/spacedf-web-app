import React, { memo, useEffect } from 'react'
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
import { useCreateWidget } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/test-api/hooks/useCreateWidget'
import { useUpdateWidgets } from '@/containers/dashboard/components/widget-list/hooks/useUpdateWidgets'
import { mergeFormDefaults } from '@/containers/dashboard/components/widget-selected/utils/merge-configuration'
import { WidgetLayout } from '@/types/widget'
import { toast } from 'sonner'
import { uuidv4 } from '@/utils'

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
  editingWidgetLayout?: WidgetLayout | null
  onSaveWidget: () => void
  onBack: () => void
  onClose: () => void
}

const TableWidget: React.FC<Props> = ({
  selectedWidget,
  editingWidgetLayout,
  onSaveWidget,
  onClose,
  onBack,
}) => {
  const t = useTranslations('dashboard')
  const form = useForm<mapPayload>({
    resolver: zodResolver(mapSchema),
    defaultValues: defaultMapValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (!editingWidgetLayout?.configuration) return
    const cfg = editingWidgetLayout.configuration as unknown as Record<
      string,
      unknown
    >
    form.reset(mergeFormDefaults(defaultMapValues, cfg))
  }, [editingWidgetLayout?.id])

  const { control, trigger } = form

  const [source, widget_info] = useWatch({
    control,
    name: ['sources.0', 'widget_info'],
  })

  const { createWidget, isMutating } = useCreateWidget({
    onSuccess: () => {
      toast.success('Created map widget successfully')
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

  const handleSaveMapWidget = async () => {
    const isValid = await trigger()
    if (!isValid) return
    const values = form.getValues()

    if (editingWidgetLayout) {
      const prev = editingWidgetLayout.configuration
      const newConfiguration = {
        ...prev,
        ...values,
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
      display_type: 'map',
      entity_id: values.sources[0]?.entity_id,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      configuration: {
        id: uuidv4(),
        ...values,
        type: selectedWidget,
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        minH: 2,
        minW: 2,
      },
    }
    createWidget(newWidgetData)
  }

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onBack} />
          <div>
            {t(editingWidgetLayout ? 'edit_map_widget' : 'add_map_widget')}
          </div>
        </div>
      }
      externalButton={
        <Button
          onClick={handleSaveMapWidget}
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

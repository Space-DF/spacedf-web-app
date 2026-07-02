import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { WidgetType } from '@/widget-models/widget'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useEffect } from 'react'
import TabWidget, { TabKey } from '../tab-widget'

import { TabsContent } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useCreateWidget } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/test-api/hooks/useCreateWidget'
import { useUpdateWidgets } from '@/containers/dashboard/components/widget-list/hooks/useUpdateWidgets'
import { mergeFormDefaults } from '@/containers/dashboard/components/widget-selected/utils/merge-configuration'
import { WidgetLayout } from '@/types/widget'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import SwitchSource from './components/source'
import { defaultSwitchValues, SwitchPayload, switchSchema } from '@/validator'
import SwitchWidgetInfo from './components/widget-info'
import { uuidv4 } from '@/utils'

interface Props {
  selectedWidget: WidgetType
  editingWidgetLayout?: WidgetLayout | null
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
        <SwitchSource />
      </TabsContent>
      <TabsContent value={TabKey.Info} className="mt-4 px-4">
        <SwitchWidgetInfo />
      </TabsContent>
    </>
  )
}

const SwitchWidget: React.FC<Props> = ({
  selectedWidget,
  editingWidgetLayout,
  onSaveWidget,
  onClose,
  onBack,
}) => {
  const t = useTranslations('dashboard')
  const form = useForm<SwitchPayload>({
    resolver: zodResolver(switchSchema),
    defaultValues: defaultSwitchValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (!editingWidgetLayout?.configuration) return
    const cfg = editingWidgetLayout.configuration as unknown as Record<
      string,
      unknown
    >
    form.reset(
      mergeFormDefaults(
        defaultSwitchValues as unknown as Record<string, unknown>,
        cfg
      ) as SwitchPayload
    )
  }, [editingWidgetLayout?.id])

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

  const { trigger: updateWidgets, isMutating: isUpdatingWidgets } =
    useUpdateWidgets()

  const { control } = form

  const [widgetName, enabled] = useWatch({
    control,
    name: ['widget_info.name', 'enabled'],
  })

  const handleSaveWidget = async () => {
    const isValid = await form.trigger()
    if (!isValid) return
    const switchValue = form.getValues()

    if (editingWidgetLayout) {
      const prev = editingWidgetLayout.configuration
      const newConfiguration = {
        ...prev,
        ...switchValue,
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
      display_type: 'switch',
      entity_id: switchValue.source?.entity_id,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      configuration: {
        ...switchValue,
        id: uuidv4(),
        type: selectedWidget,
        x: 0,
        y: 0,
        w: 2,
        h: 2,
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
            {t(
              editingWidgetLayout ? 'edit_switch_widget' : 'add_switch_widget'
            )}
          </div>
        </div>
      }
      externalButton={
        <Button
          onClick={handleSaveWidget}
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
                  {widgetName}
                </p>
                <Switch
                  defaultChecked={enabled}
                  onCheckedChange={(checked) =>
                    form.setValue('enabled', checked)
                  }
                />
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

export default memo(SwitchWidget)

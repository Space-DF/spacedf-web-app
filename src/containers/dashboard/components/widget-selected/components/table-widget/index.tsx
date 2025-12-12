import React, { memo } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Source from './components/table-source'
import TabWidget, { TabKey } from '../tab-widget'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RightSideBarLayout } from '@/components/ui'
import { WidgetType } from '@/widget-models/widget'
import {
  dataTableDefault,
  dataTablePayload,
  dataTableSchema,
} from '@/validator'
import TablePreview from './components/table-preview'
import TableWidgetInfo from './components/widget-info'
import ColumnForm from './components/columns'
import Conditionals from './components/conditionals'
import { v4 as uuidv4 } from 'uuid'
import { useCreateWidget } from '@/app/[locale]/[organization]/(withAuth)/test-api/hooks/useCreateWidget'
import { toast } from 'sonner'

const TABLE_TABS_KEY = [
  TabKey.Sources,
  TabKey.Columns,
  TabKey.Info,
  TabKey.Conditional,
]

const TabContents = () => {
  return (
    <>
      <TabsContent value={TabKey.Sources}>
        <Source />
      </TabsContent>
      <TabsContent value={TabKey.Columns}>
        <ColumnForm />
      </TabsContent>
      <TabsContent value={TabKey.Info}>
        <TableWidgetInfo />
      </TabsContent>
      <TabsContent value={TabKey.Conditional}>
        <Conditionals />
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

const TableWidget: React.FC<Props> = ({
  selectedWidget,
  onSaveWidget,
  onClose,
  onBack,
}) => {
  const t = useTranslations('dashboard')
  const form = useForm<dataTablePayload>({
    resolver: zodResolver(dataTableSchema),
    defaultValues: dataTableDefault,
    mode: 'onChange',
  })

  const columns = form.watch('columns')
  const source = form.watch('source.entities')
  const widget_info = form.watch('widget_info')
  const conditionals = form.watch('conditionals')

  const tableValue = form.getValues()

  const { createWidget } = useCreateWidget({
    onSuccess: () => {
      toast.success('Created table widget successfully')
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

  const handleAddTableWidget = async () => {
    const isValid = await form.trigger()
    if (!isValid) return
    const newWidgetData = {
      configuration: {
        ...tableValue,
        id: uuidv4(),
        type: selectedWidget,
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        minH: 3,
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
          <div>{t(`add_table_widget`)}</div>
        </div>
      }
      externalButton={
        <Button onClick={handleAddTableWidget}>{t('save')}</Button>
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
              <div className="grid grid-cols-1">
                <TablePreview
                  source={source}
                  columns={columns}
                  conditionals={conditionals}
                />
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

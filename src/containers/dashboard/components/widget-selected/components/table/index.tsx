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
  onClose: () => void
}

const TableWidget: React.FC<Props> = ({ onClose }) => {
  const t = useTranslations('dashboard')
  const form = useForm<dataTablePayload>({
    resolver: zodResolver(dataTableSchema),
    defaultValues: dataTableDefault,
    mode: 'onChange',
  })

  const columns = form.watch('columns')
  const source = form.watch('source.devices')
  const widget_info = form.watch('widget_info')
  const conditionals = form.watch('conditionals')

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onClose} />
          <div>{t(`add_table_widget`)}</div>
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
            <div className="rounded-lg bg-brand-component-fill-gray-soft p-2 text-xs">
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

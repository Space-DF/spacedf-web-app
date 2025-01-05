import React, { memo } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Source from './components/source'
import TabWidget, { TabKey } from '../tab-widget'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RightSideBarLayout } from '@/components/ui'
import { WidgetType } from '@/widget-models/widget'
import {
  columnTableDefault,
  dataTablePayload,
  dataTableSchema,
} from '@/validator'
import TablePreview from './components/table-preview'
import TableWidgetInfo from './components'
import ColumnForm from './components/columns'

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
        <p>Conditional Formatting</p>
      </TabsContent>
    </>
  )
}

interface Props {
  selectedWidget: WidgetType
  onClose: () => void
}

const TableWidget: React.FC<Props> = ({ selectedWidget, onClose }) => {
  const t = useTranslations()
  const form = useForm<dataTablePayload>({
    resolver: zodResolver(dataTableSchema),
    defaultValues: columnTableDefault,
    mode: 'onChange',
  })

  const columns = form.watch('columns')
  const source = form.watch('source.devices')
  const widget_info = form.watch('widget_info')
  const conditional = form.watch('conditional')

  return (
    <RightSideBarLayout
      title={
        <div className="flex items-center gap-2">
          <ArrowLeft size={20} className="cursor-pointer" onClick={onClose} />
          <div>{t(`dashboard.add_chart_widget`)}</div>
        </div>
      }
      externalButton={<Button>{t('dashboard.save')}</Button>}
      onClose={onClose}
    >
      <div className="flex size-full flex-col">
        <div className="h-fit p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-component-text-dark">
              {t('dashboard.preview')}
            </p>
            <div className="rounded-lg bg-brand-component-fill-gray-soft p-2 text-xs">
              <p className="rounded-t-md bg-brand-component-fill-light-fixed px-2 pb-1 pt-3 font-semibold text-brand-component-text-dark dark:bg-brand-heading">
                {widget_info.name}
              </p>
              <div className="grid grid-cols-1">
                <TablePreview
                  source={source}
                  columns={columns}
                  conditional={conditional}
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

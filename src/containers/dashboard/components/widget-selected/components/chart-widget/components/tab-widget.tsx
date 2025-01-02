import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import ChartSource from './sources'
import { UseFormReturn } from 'react-hook-form'
import { ChartSources, ChartType } from '@/widget-models/chart'

interface Props {
  form: UseFormReturn<
    {
      sources: ChartSources[]
    },
    any,
    undefined
  >
}

const TABS = [
  { value: 'sources', label: 'dashboard.sources' },
  { value: 'info', label: 'dashboard.widget_info' },
  { value: 'axes', label: 'dashboard.axes' },
  { value: 'timeframe', label: 'dashboard.timeframe' },
]

const TabWidget: React.FC<Props> = ({ form }) => {
  const t = useTranslations()
  return (
    <Tabs
      defaultValue="sources"
      className="size-full overflow-y-auto scroll-smooth px-0 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]"
    >
      <TabsList className="flex w-full items-end rounded-none border-b border-brand-stroke-dark-soft bg-transparent p-0 px-2">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-full rounded-none px-0 py-2 text-xs font-medium text-brand-component-text-gray focus-visible:outline-none data-[state=active]:border-b-2 data-[state=active]:border-brand-component-text-dark data-[state=active]:bg-transparent data-[state=active]:text-brand-component-text-dark data-[state=active]:shadow-none"
          >
            {t(tab.label as any)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="sources" className="flex-1 overflow-y-scroll px-4">
        <ChartSource form={form} />
      </TabsContent>
      <TabsContent value="info" className="mt-4 p-4">
        <p>Content for Widget Info</p>
      </TabsContent>
      <TabsContent value="axes" className="mt-4 p-4">
        <p>Axes</p>
      </TabsContent>
      <TabsContent value="timeframe" className="mt-4 p-4">
        <p>Content for Timeframe</p>
      </TabsContent>
    </Tabs>
  )
}

export default TabWidget

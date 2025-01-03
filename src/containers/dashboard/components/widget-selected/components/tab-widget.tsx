import React, { useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import ChartSource from './chart-widget/components/sources'

interface Props {
  tabKeys: string[]
  tabContents: React.ReactNode
}

export enum ChartTabKey {
  Sources = 'sources',
  Info = 'info',
  Axes = 'axes',
  TimeFrame = 'timeframe',
}

const TABS = [
  { value: ChartTabKey.Sources, label: 'sources' },
  { value: ChartTabKey.Info, label: 'widget_info' },
  { value: ChartTabKey.Axes, label: 'axes' },
  { value: ChartTabKey.TimeFrame, label: 'timeframe' },
]

const TabWidget: React.FC<Props> = ({ tabKeys, tabContents }) => {
  const tabs = useMemo(
    () => TABS.filter((tab) => tabKeys.includes(tab.value)),
    [tabKeys],
  )
  const t = useTranslations('dashboard')
  return (
    <Tabs
      defaultValue="sources"
      className="size-full overflow-y-auto scroll-smooth px-0 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]"
    >
      <TabsList className="flex w-full items-end rounded-none border-b border-brand-stroke-dark-soft bg-transparent p-0 px-2">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-full rounded-none px-0 py-2 text-xs font-medium text-brand-component-text-gray focus-visible:outline-none data-[state=active]:border-b-2 data-[state=active]:border-brand-component-text-dark data-[state=active]:bg-transparent data-[state=active]:text-brand-component-text-dark data-[state=active]:shadow-none"
          >
            {t(tab.label as any)}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabContents}
    </Tabs>
  )
}

export default TabWidget

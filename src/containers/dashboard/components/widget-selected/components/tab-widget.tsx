import React, { useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'

interface Props {
  tabKeys: `${TabKey}`[]
  tabContents: React.ReactNode
}

export enum TabKey {
  Sources = 'sources',
  Info = 'info',
  Axes = 'axes',
  TimeFrame = 'timeframe',
  Columns = 'columns',
  Conditional = 'conditional',
}

const TABS = [
  { value: TabKey.Sources, label: 'dashboard.sources' },
  { value: TabKey.Columns, label: 'dashboard.columns' },
  { value: TabKey.Info, label: 'dashboard.widget_info' },
  { value: TabKey.Axes, label: 'dashboard.axes' },
  { value: TabKey.TimeFrame, label: 'dashboard.timeframe' },
  { value: TabKey.Conditional, label: 'dashboard.conditional' },
]

const TabWidget: React.FC<Props> = ({ tabKeys, tabContents }) => {
  const tabs = useMemo(
    () => TABS.filter((tab) => tabKeys.includes(tab.value)),
    [tabKeys]
  )
  const t = useTranslations()
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
      <div className="mb-8">{tabContents}</div>
    </Tabs>
  )
}

export default TabWidget

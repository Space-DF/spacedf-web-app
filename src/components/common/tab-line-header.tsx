import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

interface Props {
  tabs: { value: string; label: string }[]
  tabContents: React.ReactNode
  defaultValue?: string
  currentTab?: string
  onTabChange?: (tab: string) => void
}

const TabLineHeader = ({
  tabs,
  tabContents,
  defaultValue,
  currentTab,
  onTabChange,
}: Props) => {
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0].value}
      className="size-full"
      value={currentTab}
      onValueChange={onTabChange}
    >
      <TabsList className="flex w-full items-end rounded-none border-b border-brand-stroke-dark-soft bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-full rounded-none px-0 py-2 text-sm font-medium text-brand-component-text-gray focus-visible:outline-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="h-full overflow-y-auto">{tabContents}</div>
    </Tabs>
  )
}

export default TabLineHeader

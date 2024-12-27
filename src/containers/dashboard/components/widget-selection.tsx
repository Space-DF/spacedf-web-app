'use client'
import React, { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import {
  ChartWidgetIcon,
  GaugeWidgetIcon,
  ValueWidgetIcon,
  TableWidgetIcon,
  MapWidgetIcon,
} from '@/components/icons'
import { useDebounce } from '@/hooks'

type Widget = {
  icon: React.ReactNode
  title: string
}

const WIDGET_LIST: Widget[] = [
  { icon: <ChartWidgetIcon />, title: 'Chart' },
  { icon: <GaugeWidgetIcon />, title: 'Gauge' },
  { icon: <ValueWidgetIcon />, title: 'Value' },
  { icon: <TableWidgetIcon />, title: 'Table' },
  { icon: <MapWidgetIcon />, title: 'Map' },
]

const WidgetSelection = ({
  onSelectWidget,
  selectedWidget,
}: {
  onSelectWidget: (widgetTitle: string) => void
  selectedWidget: string
}) => {
  const t = useTranslations()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredWidgets: Widget[] = useMemo(() => {
    const lowerSearchTerm = debouncedSearchTerm.toLowerCase()
    return WIDGET_LIST.filter((widget) =>
      widget.title.toLowerCase().includes(lowerSearchTerm),
    )
  }, [debouncedSearchTerm])

  return (
    <div className="block size-full animate-opacity-display-effect">
      {!selectedWidget ? (
        <div className="flex animate-opacity-display-effect flex-col items-center justify-center gap-6">
          <Input
            className="w-full bg-brand-component-fill-gray-soft outline-none dark:border-brand-component-stroke-secondary"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('dashboard.search_for_widget')}
          />
          <div className="grid w-full grid-cols-2 gap-4">
            {filteredWidgets.map((widget) => (
              <div
                key={widget.title}
                onClick={() => onSelectWidget(widget.title)}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-sm bg-brand-component-fill-gray-soft p-2 dark:bg-brand-component-fill-gray-soft"
              >
                <div className="flex w-full items-center justify-center rounded-sm bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                  {widget.icon}
                </div>
                <div className="text-center text-xs">{widget.title}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <WidgetConfig widgetType={selectedWidget} />
      )}
    </div>
  )
}

export default WidgetSelection

const WidgetConfig = ({ widgetType }: { widgetType: string }) => {
  switch (widgetType) {
    case 'Chart':
      return <div>Chart</div>
    case 'Gauge':
      return <div>Gauge</div>
    case 'Value':
      return <div>Value</div>
    case 'Table':
      return <div>Table</div>
    case 'Map':
      return <div>Map</div>
    default:
      return <div>Unknown Widget</div>
  }
}

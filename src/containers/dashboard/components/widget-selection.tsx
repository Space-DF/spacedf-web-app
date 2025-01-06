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
import { WidgetType } from '@/widget-models/widget'

type Widget = {
  icon: React.ReactNode
  title: string
  value: WidgetType
}

const WIDGET_LIST: Widget[] = [
  { icon: <ChartWidgetIcon />, title: 'Chart', value: WidgetType.Chart },
  { icon: <GaugeWidgetIcon />, title: 'Gauge', value: WidgetType.Gauge },
  { icon: <ValueWidgetIcon />, title: 'Value', value: WidgetType.Value },
  { icon: <TableWidgetIcon />, title: 'Table', value: WidgetType.Table },
  { icon: <MapWidgetIcon />, title: 'Map', value: WidgetType.Map },
]

const WidgetSelection = ({
  onSelectWidget,
  selectedWidget,
}: {
  onSelectWidget: (widgetTitle: WidgetType) => void
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
              onClick={() => onSelectWidget(widget.value)}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg bg-brand-component-fill-gray-soft p-2 duration-300 hover:scale-105 dark:bg-brand-component-fill-gray-soft"
            >
              <div className="flex w-full items-center justify-center rounded-lg bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                {widget.icon}
              </div>
              <div className="text-center text-xs">{widget.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WidgetSelection

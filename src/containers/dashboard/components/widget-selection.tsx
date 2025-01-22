'use client'
import React, { useMemo, useState } from 'react'
import { InputWithIcon } from '@/components/ui/input'
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
import { SearchIcon } from 'lucide-react'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useMounted } from '@/hooks'

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

const ResponsiveReactGridLayout = WidthProvider(Responsive)

const screenXXSLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 1 },
  { i: '2', x: 1, y: 0, w: 2, h: 1 },
  { i: '3', x: 2, y: 1, w: 2, h: 1 },
  { i: '4', x: 3, y: 1, w: 2, h: 1 },
  { i: '5', x: 4, y: 2, w: 2, h: 1 },
]

const screenXSLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 1 },
  { i: '2', x: 3, y: 0, w: 2, h: 1 },
  { i: '3', x: 0, y: 1, w: 2, h: 1 },
  { i: '4', x: 3, y: 1, w: 2, h: 1 },
  { i: '5', x: 0, y: 2, w: 2, h: 1 },
]

const screenSMLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 1 },
  { i: '2', x: 3, y: 0, w: 2, h: 1 },
  { i: '3', x: 6, y: 0, w: 2, h: 1 },
  { i: '4', x: 0, y: 1, w: 2, h: 1 },
  { i: '5', x: 3, y: 1, w: 2, h: 1 },
]

const screenMDLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 1 },
  { i: '2', x: 2, y: 0, w: 2, h: 1 },
  { i: '3', x: 5, y: 0, w: 2, h: 1 },
  { i: '4', x: 7, y: 0, w: 2, h: 1 },
  { i: '5', x: 0, y: 1, w: 2, h: 1 },
]

const screenLayout: Layouts = {
  xxs: screenXXSLayout,
  xs: screenXSLayout,
  sm: screenSMLayout,
  md: screenMDLayout,
  lg: screenMDLayout,
}

const WidgetSelection = ({
  onSelectWidget,
}: {
  onSelectWidget: (widgetTitle: WidgetType) => void
  selectedWidget: string
}) => {
  const t = useTranslations()
  const { mounted } = useMounted()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [layouts, setLayouts] = useState<Layouts>(screenLayout)

  const handleLayoutChange = (_: Layout[], layouts: Layouts) => {
    setLayouts({ ...layouts })
  }

  const filteredWidgets: Widget[] = useMemo(() => {
    if (!debouncedSearchTerm) return WIDGET_LIST
    const lowerSearchTerm = debouncedSearchTerm.toLowerCase()
    return WIDGET_LIST.filter((widget) =>
      widget.title.toLowerCase().includes(lowerSearchTerm)
    )
  }, [debouncedSearchTerm])

  return (
    <div className="block size-full animate-opacity-display-effect">
      <div className="flex animate-opacity-display-effect flex-col items-center justify-center gap-6">
        <InputWithIcon
          wrapperClass="w-full rounded-lg bg-brand-component-fill-gray-soft outline-none dark:border-brand-component-stroke-secondary-soft"
          prefixCpn={<SearchIcon size={18} />}
          value={searchTerm}
          placeholder={t('dashboard.search_for_widget')}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ResponsiveReactGridLayout
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 728, sm: 412, xs: 360, xxs: 0 }}
          cols={{ lg: 8, md: 8, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={120}
          margin={[10, 10]}
          onLayoutChange={handleLayoutChange}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          compactType="horizontal"
          preventCollision={false}
          className="w-full"
          isDraggable={false}
          isResizable={false}
        >
          {filteredWidgets.map((widget, index) => (
            <div key={`${index + 1}`}>
              <div
                onClick={() => onSelectWidget(widget.value)}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg bg-brand-component-fill-gray-soft p-2 duration-300 hover:scale-105 dark:bg-brand-component-fill-gray-soft"
              >
                <div className="flex w-full items-center justify-center rounded-lg bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                  {widget.icon}
                </div>
                <div className="text-center text-sm">{widget.title}</div>
              </div>
            </div>
          ))}
        </ResponsiveReactGridLayout>
      </div>
    </div>
  )
}

export default WidgetSelection

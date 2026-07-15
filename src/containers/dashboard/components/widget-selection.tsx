'use client'
import React, { useCallback, useMemo, useState } from 'react'
import { DebouncedSearchInput } from '@/components/common/debounced-search-input'
import { useTranslations } from 'next-intl'
import {
  ChartWidgetIcon,
  GaugeWidgetIcon,
  ValueWidgetIcon,
  TableWidgetIcon,
  MapWidgetIcon,
  SwitchWidgetIcon,
  HistogramIcon,
} from '@/components/icons'
import { WidgetType } from '@/widget-models/widget'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useMounted } from '@/hooks'
import SliderWidgetIcon from '@/components/icons/slider-widget'

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
  { icon: <SwitchWidgetIcon />, title: 'Switch', value: WidgetType.Switch },
  { icon: <SliderWidgetIcon />, title: 'Slider', value: WidgetType.Slider },
  { icon: <HistogramIcon />, title: 'Histogram', value: WidgetType.Histogram },
]

const ResponsiveReactGridLayout = WidthProvider(Responsive)

const screenXXSLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 1 },
  { i: '2', x: 0, y: 1, w: 2, h: 1 },
  { i: '3', x: 0, y: 2, w: 2, h: 1 },
  { i: '4', x: 0, y: 3, w: 2, h: 1 },
  { i: '5', x: 0, y: 4, w: 2, h: 1 },
  { i: '6', x: 0, y: 5, w: 2, h: 1 },
  { i: '7', x: 0, y: 6, w: 2, h: 1 },
  { i: '8', x: 0, y: 7, w: 2, h: 1 },
]

const screenXSLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 1 },
  { i: '2', x: 2, y: 0, w: 2, h: 1 },
  { i: '3', x: 0, y: 1, w: 2, h: 1 },
  { i: '4', x: 2, y: 1, w: 2, h: 1 },
  { i: '5', x: 0, y: 2, w: 2, h: 1 },
  { i: '6', x: 2, y: 2, w: 2, h: 1 },
  { i: '7', x: 0, y: 3, w: 2, h: 1 },
  { i: '8', x: 2, y: 3, w: 2, h: 1 },
]

const screenSMLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 1 },
  { i: '2', x: 2, y: 0, w: 2, h: 1 },
  { i: '3', x: 4, y: 0, w: 2, h: 1 },
  { i: '4', x: 0, y: 1, w: 2, h: 1 },
  { i: '5', x: 2, y: 1, w: 2, h: 1 },
  { i: '6', x: 4, y: 1, w: 2, h: 1 },
  { i: '7', x: 0, y: 2, w: 2, h: 1 },
  { i: '8', x: 2, y: 2, w: 2, h: 1 },
]

const screenMDLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 2, h: 1 },
  { i: '2', x: 2, y: 0, w: 2, h: 1 },
  { i: '3', x: 4, y: 0, w: 2, h: 1 },
  { i: '4', x: 6, y: 0, w: 2, h: 1 },
  { i: '5', x: 0, y: 1, w: 2, h: 1 },
  { i: '6', x: 2, y: 1, w: 2, h: 1 },
  { i: '7', x: 4, y: 1, w: 2, h: 1 },
  { i: '8', x: 6, y: 1, w: 2, h: 1 },
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
}) => {
  const t = useTranslations()
  const { mounted } = useMounted()
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const handleSearch = useCallback(
    (value: string) => setDebouncedSearchTerm(value),
    []
  )
  const [layouts, setLayouts] = useState<Layouts>(screenLayout)

  const handleLayoutChange = (_: Layout[], layouts: Layouts) => {
    setLayouts(layouts)
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
      <div className="flex size-full animate-opacity-display-effect flex-col items-center justify-center gap-4">
        <div className="px-2 w-full">
          <DebouncedSearchInput
            wrapperClass="w-full h-fit bg-brand-component-fill-gray-soft outline-none dark:border-brand-component-stroke-secondary-soft"
            onSearch={handleSearch}
            placeholder={t('dashboard.search_for_widget')}
            delay={300}
          />
        </div>
        <div className="w-full flex-1 overflow-y-scroll mb-6 scroll-smooth [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F] px-2  pt-2">
          <ResponsiveReactGridLayout
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 728, sm: 412, xs: 360, xxs: 0 }}
            cols={{ lg: 8, md: 8, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={120}
            margin={[8, 8]}
            containerPadding={[0, 0]}
            onLayoutChange={handleLayoutChange}
            measureBeforeMount={false}
            useCSSTransforms={mounted}
            compactType="horizontal"
            preventCollision={false}
            className="w-full"
            style={{ overflow: 'visible' }}
            isDraggable={false}
            isResizable={false}
          >
            {filteredWidgets.map((widget, index) => (
              <div key={`${index + 1}`} className="h-full overflow-visible">
                <div
                  onClick={() => onSelectWidget(widget.value)}
                  className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-card bg-card border border-border p-2 duration-300 hover:scale-105 dark:bg-brand-component-fill-gray-soft"
                >
                  <div className="flex w-full items-center justify-center rounded-card bg-card border border-border">
                    {widget.icon}
                  </div>
                  <div className="text-center text-sm">{widget.title}</div>
                </div>
              </div>
            ))}
          </ResponsiveReactGridLayout>
        </div>
      </div>
    </div>
  )
}

export default WidgetSelection

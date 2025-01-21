'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'
import { useMounted } from '@/hooks'
import { useGetWidgets } from '@/app/[locale]/[organization]/(withAuth)/test-api/hooks/useGetWidget'
import { useScreenLayoutStore } from '@/stores/dashboard-layout'
import GridLayout from '../grid-layout'
import {
  WidgetContainer,
  WidgetSensor,
  WidgetSwitch,
  WidgetText,
  WidgetSlider,
  WidgetChart,
  PolarChart,
  WidgetTitle,
} from './mock-data.components'
import { PreviewChart } from '../widget-selected/components/chart-widget/components/preview-chart'
import TablePreview from '../widget-selected/components/table-widget/components/table-preview'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

interface Props {
  isEdit?: boolean
}

export const MockData: React.FC<Props> = ({ isEdit }) => {
  const { mounted } = useMounted()
  const { layouts, setLayouts } = useScreenLayoutStore((state) => ({
    layouts: state.layouts,
    setLayouts: state.setLayouts,
  }))
  const { data } = useGetWidgets()

  const handleLayoutChange = (_: Layout[], layouts: Layouts) => {
    setLayouts(layouts)
  }

  return (
    <div
      className={cn(
        'mt-1 h-dvh overflow-y-scroll scroll-smooth transition-all [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]'
      )}
    >
      <div
        className={cn(isEdit ? 'pb-44' : 'pb-32', 'relative')}
        id="dashboard-container"
      >
        {isEdit && <GridLayout margin={5} rowHeight={60} />}
        <ResponsiveReactGridLayout
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 5, md: 5, sm: 5, xs: 5, xxs: 5 }}
          rowHeight={60}
          margin={[5, 5]}
          onLayoutChange={handleLayoutChange}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          compactType="vertical"
          preventCollision={false}
          isDraggable={isEdit}
          isResizable={isEdit}
        >
          {data &&
            data.map((widget) => {
              switch (widget.widget_type) {
                case 'map':
                  return (
                    <div key={widget.id}>
                      <MapWidget widget={widget} />
                    </div>
                  )
                case 'value':
                  return (
                    <div key={widget.id}>
                      <ValueWidget widget={widget} />
                    </div>
                  )

                case 'table':
                  return (
                    <div key={widget.id}>
                      <TableWidget widget={widget} />
                    </div>
                  )

                case 'chart':
                  return (
                    <div key={widget.id}>
                      <ChartWidget widget={widget} />
                    </div>
                  )
                default:
                  return null
              }
            })}
          <div key="1">
            <WidgetSlider />
          </div>
          <div key={'2'}>
            <WidgetChart className="dark:text-[#4006AA]">
              <WidgetTitle>Water Flood Level</WidgetTitle>
            </WidgetChart>
          </div>
          <div key="3">
            <WidgetSwitch>
              <WidgetTitle>Text</WidgetTitle>
            </WidgetSwitch>
          </div>
          <div key="4">
            <WidgetSensor status="on">
              <WidgetTitle>Text</WidgetTitle>{' '}
            </WidgetSensor>
          </div>
          <div key="5">
            <WidgetText />
          </div>
          <div key={'6'} className="h-fit">
            <PolarChart className="aspect-square dark:text-[#4006AA]">
              <WidgetTitle>New Gauge Widget</WidgetTitle>
            </PolarChart>
          </div>
        </ResponsiveReactGridLayout>
      </div>
    </div>
  )
}

const MapWidget = ({ widget }: any) => {
  const { sources, widget_info } = widget
  return (
    <WidgetContainer className="flex flex-col ">
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      <iframe
        className="flex-1 size-full rounded"
        src={`https://www.google.com/maps?q=${sources[0]?.coordinate[0]},${sources[0]?.coordinate[1]}&z=15&t=${sources[0]?.map_type}&output=embed`}
        loading="lazy"
      />
    </WidgetContainer>
  )
}

const ChartWidget = ({ widget }: any) => {
  const { sources, widget_info, axes } = widget

  const isSingleSource = Array.isArray(sources) && sources.length === 1

  return (
    <WidgetContainer>
      <PreviewChart
        sources={sources}
        isSingleSource={isSingleSource}
        showData={widget_info.appearance?.show_value}
        orientation={axes.y_axis?.orientation}
        hideAxis={axes?.hide_axis}
        showXGrid={axes?.is_show_grid}
        format={axes?.format}
      />
    </WidgetContainer>
  )
}

const TableWidget = ({ widget }: any) => {
  const { source, columns, widget_info, conditionals } = widget

  return (
    <WidgetContainer>
      <div className="rounded-lg size-full flex flex-col bg-brand-component-fill-gray-soft p-2 text-sm">
        <WidgetTitle className="pb-1">{widget_info?.name}</WidgetTitle>
        <TablePreview
          source={source?.devices}
          columns={columns}
          conditionals={conditionals}
        />
      </div>
    </WidgetContainer>
  )
}

const ValueWidget = ({ widget }: any) => {
  const { source, widget_info } = widget
  const { decimal, unit } = source

  const value = 0

  const currentValue = useMemo(() => {
    if (!decimal || decimal < 0) return value.toFixed(0)
    if (decimal > 10) return value.toFixed(10)
    return value.toFixed(decimal)
  }, [value, decimal])

  return (
    <WidgetContainer>
      <div className="rounded-lg size-full bg-brand-component-fill-gray-soft p-2">
        <div className="flex gap-2 flex-col size-full rounded-md bg-brand-background-fill-outermost p-1">
          <div className="w-full">
            <div className="h-5">
              <p className="truncate font-semibold text-brand-component-text-dark">
                {widget_info?.name}
              </p>
            </div>

            <p className="text-[12px] text-brand-text-gray">No data</p>
          </div>
          <div className="grid flex-1 grid-cols-1 space-y-4">
            <span
              className="text-brand-component-text-dark text-xl font-semibold truncate"
              style={{ color: `#${widget_info?.color}` }}
            >
              {`${currentValue} ${unit ?? ''}`}
            </span>
          </div>
        </div>
      </div>
    </WidgetContainer>
  )
}

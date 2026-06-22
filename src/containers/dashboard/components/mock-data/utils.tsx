import React, { memo, useCallback, forwardRef } from 'react'
import {
  Widget,
  WidgetChart,
  WidgetChartData,
  WidgetLayout,
  WidgetProgress,
  WidgetTable,
  WidgetMapData,
  WidgetValueData,
} from '@/types/widget'
import { WidgetType } from '@/widget-models/widget'
import dynamic from 'next/dynamic'
import { MakeRequired } from '@/types/common'
import { mapPayload, SliderSource } from '@/validator'

import { TextWidget } from './components/widget-text'
import { MapWidget } from './components/widget-map'
import { TableWidget } from './components/widget-table'
import { ValueWidget } from './components/widget-value'
import { WidgetCamera } from './components/widget-camera'
import { WidgetUnit } from './components/widget-unit'
import { WidgetSwitch } from './components/widget-switch'
import { ProgressWidget } from './components/widget-progress'
import { WidgetSensor } from './components/widget-sensor'
import WidgetSlider from './components/widget-slider'

const ChartWidget = dynamic(
  () => import('./components/widget-chart').then((m) => m.ChartWidget),
  { ssr: false }
)
const GaugeWidget = dynamic(
  () => import('./components/widget-gauge').then((m) => m.GaugeWidget),
  { ssr: false }
)
const WidgetHistogram = dynamic(
  () => import('./components/widget-histogram').then((m) => m.WidgetHistogram),
  { ssr: false }
)

const getSwitchValue = (value: any) => {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (['on', 'true', '1'].includes(normalized)) return true
    if (['off', 'false', '0'].includes(normalized)) return false
  }
  return !!value
}

// Module-level static objects to prevent re-renders caused by object literal reference changes
const DEFAULT_MAP_DATA: WidgetMapData = {
  coordinate: { latitude: 0, longitude: 0 },
}

const DEFAULT_VALUE_DATA: WidgetValueData = {
  value: 0,
  unit_of_measurement: '',
}

const DEFAULT_CHART_DATA: WidgetChartData = {
  data: [],
}

export interface WidgetRendererProps {
  widget: Widget
  data: WidgetLayout
  onDelete: (id: string) => void
  onEdit: (layout: WidgetLayout) => void
  isEdit?: boolean
  [key: string]: any // To catch any props passed by react-grid-layout
}

export const WidgetRenderer = memo(
  forwardRef<HTMLDivElement, WidgetRendererProps>(
    ({ widget, data, onDelete, onEdit, isEdit, children, ...props }, ref) => {
      const handleDelete = useCallback(
        () => onDelete(widget.widgetId),
        [onDelete, widget.widgetId]
      )
      const handleEdit = useCallback(() => onEdit(data), [onEdit, data])

      const renderContent = () => {
        switch (widget.type) {
          case WidgetType.Text:
            return (
              <TextWidget
                content={widget.content || ''}
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Map:
            return (
              <MapWidget
                {...(widget as mapPayload)}
                data={
                  (data?.data as WidgetMapData | undefined) ?? DEFAULT_MAP_DATA
                }
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Value:
            return (
              <ValueWidget
                widget={widget}
                data={
                  (data?.data as WidgetValueData | undefined) ??
                  DEFAULT_VALUE_DATA
                }
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Table:
            return (
              <TableWidget
                {...(widget as MakeRequired<WidgetTable>)}
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Chart:
            return (
              <ChartWidget
                {...(widget as WidgetChart)}
                isShowFullChart
                id={widget.id}
                data={
                  (data?.data as WidgetChartData | undefined) ??
                  DEFAULT_CHART_DATA
                }
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Gauge:
            return (
              <GaugeWidget
                widget={widget}
                data={
                  (data?.data as WidgetValueData | undefined) ??
                  DEFAULT_VALUE_DATA
                }
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Camera:
            return (
              <WidgetCamera
                widget_info={widget.widget_info!}
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Unit:
            return (
              <WidgetUnit
                {...(widget as MakeRequired<Widget>)}
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Progress:
            return (
              <ProgressWidget
                {...(widget as WidgetProgress)}
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Switch:
            return (
              <WidgetSwitch
                widget_info={widget.widget_info!}
                color={widget.color!}
                checked={getSwitchValue(data?.data?.value)}
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Sensor:
            return (
              <WidgetSensor
                widget_info={widget.widget_info!}
                value={widget.value!}
                sensorType={widget.sensor_type}
                color={widget.color}
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Slider:
            return (
              <WidgetSlider
                widget_info={widget.widget_info!}
                source={widget.source as unknown as MakeRequired<SliderSource>}
                data={
                  (data?.data as WidgetValueData | undefined) ??
                  DEFAULT_VALUE_DATA
                }
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          case WidgetType.Histogram:
            return (
              <WidgetHistogram
                {...(widget as WidgetChart)}
                id={widget.id}
                isEdit={isEdit}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )
          default:
            return null
        }
      }

      return (
        <div ref={ref} {...props}>
          {renderContent()}
          {children}
        </div>
      )
    }
  )
)

WidgetRenderer.displayName = 'WidgetRenderer'

import { TimeFormat } from '@/constants'
import { Device, mapPayload } from '@/validator'
import { ChartType, Orientation } from '@/widget-models/chart'
import { Table } from '@/widget-models/table'
import { WidgetInfo, WidgetType } from '@/widget-models/widget'
import { Layout } from 'react-grid-layout'

export interface WidgetUnit {
  widget_info: {
    name: string
    appearance: {
      show_value: boolean
    }
  }
  value: number
  unit: string
  status?: string
}

export interface WidgetChart {
  widget_info: WidgetInfo
  orientation: Orientation
  hideAxis: boolean
  showXGrid: boolean
  format: TimeFormat
  sources: {
    entity_id: string
    color: string
    field: string
    legend: string
    show_legend: boolean
    chart_type: ChartType
  }[]
}
export interface WidgetTable extends Table {
  source: Device[]
}

export interface WidgetText {
  content: string
}

export interface WidgetProgress {
  widget_info: WidgetInfo
  value: number
  unit: string
  min: number
  max: number
  color: string
}

export interface WidgetSensor {
  title: string
  value: string
  sensor_type?: string
}

export type Widget = {
  id: string
  type: WidgetType
  enabled?: boolean
  data: any
} & Partial<WidgetUnit> &
  Partial<WidgetChart> &
  Partial<mapPayload> &
  Partial<WidgetTable> &
  Partial<WidgetProgress> &
  Partial<WidgetText> &
  Partial<WidgetSensor> &
  Layout

export interface WidgetLayout {
  id: string
  dashboard: string
  configuration: Widget & Layout
}

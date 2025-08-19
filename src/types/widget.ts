import { TimeFormat } from '@/constants'
import { Device } from '@/validator'
import { ChartType, Orientation } from '@/widget-models/chart'
import { Table } from '@/widget-models/table'
import { WidgetType } from '@/widget-models/widget'
import { Layout } from 'react-grid-layout'

export interface WidgetUnit {
  title: string
  value: number
  unit: string
  status?: string
}

export interface WidgetChart {
  title: string
  orientation: Orientation
  hideAxis: boolean
  showXGrid: boolean
  format: TimeFormat
  sources: {
    device_id: string
    color: string
    field: string
    legend: string
    show_legend: boolean
    chart_type: ChartType
  }[]
}

export interface WidgetMap {
  title: string
  latitude: number
  longitude: number
  map_type: string
}

export interface WidgetTable extends Table {
  source: Device[]
}

export interface WidgetText {
  content: string
}

export interface WidgetProgress {
  title: string
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
} & Partial<WidgetUnit> &
  Partial<WidgetChart> &
  Partial<WidgetMap> &
  Partial<WidgetTable> &
  Partial<WidgetProgress> &
  Partial<WidgetText> &
  Partial<WidgetSensor>

export interface WidgetLayout {
  id: string
  dashboardId: number
  widgets: Widget[]
  layouts: {
    sm: Layout[]
    md: Layout[]
    lg: Layout[]
    xl: Layout[]
    xxl: Layout[]
  }
}

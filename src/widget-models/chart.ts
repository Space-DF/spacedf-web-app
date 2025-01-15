import { AggregationFunction, Sources, TimeFrame, WidgetInfo } from './widget'
export enum ChartType {
  LineChart = 'line-chart',
  AreaChart = 'area-chart',
  BarChart = 'bar-chart',
}

export enum Orientation {
  Left = 'left',
  Right = 'right',
}

export enum ResolutionUnit {
  Minutes = 'minutes',
  Hours = 'hours',
}

type YAxis = {
  orientation: Orientation
  unit: string
}

class Axes {
  y_axis: YAxis
  is_show_grid: boolean
  format: string
  hide_axis: boolean

  constructor(
    y_axis: YAxis,
    is_show_grid: boolean,
    format: string,
    hide_axis: boolean
  ) {
    this.y_axis = y_axis
    this.is_show_grid = is_show_grid
    this.format = format
    this.hide_axis = hide_axis
  }
}

export class ChartSources extends Sources {
  field: string
  legend: string
  color: string
  chart_type: ChartType
  show_legend: boolean
  constructor(
    device_id: string,
    field: string,
    legend: string,
    color: string,
    chart_type: ChartType,
    show_legend: boolean,
    device_type?: string
  ) {
    super(device_id, device_type)
    this.field = field
    this.legend = legend
    this.color = color
    this.chart_type = chart_type
    this.show_legend = show_legend
  }
}

class ChartTimeFrame extends TimeFrame {
  from: string
  until: string
  resolution?: number
  resolution_unit?: ResolutionUnit
  time_zone?: string
  constructor(
    from: string,
    until: string,
    aggregation_function: AggregationFunction,
    resolution?: number,
    resolution_unit?: ResolutionUnit,
    time_zone?: string
  ) {
    super(aggregation_function)
    this.from = from
    this.until = until
    this.resolution = resolution
    this.resolution_unit = resolution_unit
    this.time_zone = time_zone
  }
}
export class Chart {
  sources: ChartSources
  axes: Axes
  time_frame: ChartTimeFrame
  widget_info: WidgetInfo

  constructor(
    sources: ChartSources,
    axes: Axes,
    time_frame: ChartTimeFrame,
    widget_info: WidgetInfo
  ) {
    this.sources = sources
    this.axes = axes
    this.widget_info = widget_info
    this.time_frame = time_frame
  }
}

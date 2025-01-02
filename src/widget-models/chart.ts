import { Sources, TimeFrame, WidgetInfo } from './widget'
export enum ChartType {
  LineChart = 'line-chart',
  AreaChart = 'area-chart',
  BarChart = 'bar-chart',
}

class Axes {
  y_axis: object[]
  is_show_grid: boolean
  format: string

  constructor(y_axis: object[], is_show_grid: boolean, format: string) {
    this.y_axis = y_axis
    this.is_show_grid = is_show_grid
    this.format = format
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
    device_type?: string,
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
  date_range: string
  is_show_time_frame: boolean
  legend: string
  color: string
  chart_type: ChartType

  constructor(
    date_range: string,
    is_show_time_frame: boolean,
    legend: string,
    color: string,
    chart_type: ChartType,
    aggregation_function: string,
  ) {
    super(aggregation_function)
    this.date_range = date_range
    this.is_show_time_frame = is_show_time_frame
    this.legend = legend
    this.color = color
    this.chart_type = chart_type
  }
}

class Chart {
  sources: ChartSources
  axes: Axes
  time_frame: ChartTimeFrame
  widget_info: WidgetInfo

  constructor(
    sources: ChartSources,
    axes: Axes,
    time_frame: ChartTimeFrame,
    widget_info: WidgetInfo,
  ) {
    this.sources = sources
    this.axes = axes
    this.widget_info = widget_info
    this.time_frame = time_frame
  }
}

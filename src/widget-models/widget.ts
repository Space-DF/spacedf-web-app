export enum WidgetType {
  Chart = 'chart',
  Table = 'table',
  Map = 'map',
  Gauge = 'gauge',
  Value = 'value',
  Camera = 'camera',
  Unit = 'unit',
  Progress = 'progress',
  Switch = 'switch',
  Sensor = 'sensor',
  Text = 'text',
  Distance = 'distance',
  Slider = 'slider',
}

export enum AggregationFunction {
  Minimum = 'minimum',
  Average = 'average',
  Maximum = 'maximum',
}

export enum TimeFrameTab {
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Custom = 'custom',
}

export enum ResolutionUnit {
  Minutes = 'minutes',
  Hours = 'hours',
}

export class Widget {
  id: string
  type: WidgetType
  created_at: string
  updated_at: string
  sizes: object

  constructor(
    id: string,
    type: WidgetType,
    created_at: string,
    updated_at: string,
    sizes: object
  ) {
    this.id = id
    this.type = type
    this.created_at = created_at
    this.updated_at = updated_at
    this.sizes = sizes
  }
}

export class Sources {
  entity_id: string
  entity_type?: string

  constructor(entity_id: string, entity_type?: string) {
    this.entity_id = entity_id
    this.entity_type = entity_type
  }
}

export type Appearance = {
  show_value: boolean
}

export class WidgetInfo {
  name: string
  appearance: Appearance

  constructor(name: string, appearance: Appearance) {
    this.name = name
    this.appearance = appearance
  }
}

export class TimeFrame {
  aggregation_function: AggregationFunction

  constructor(aggregation_function: AggregationFunction) {
    this.aggregation_function = aggregation_function
  }
}

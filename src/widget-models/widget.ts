export enum WidgetType {
  Chart = 'chart',
  Table = 'table',
  Map = 'map',
  Gauge = 'gauge',
  Value = 'value',
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
    sizes: object,
  ) {
    this.id = id
    this.type = type
    this.created_at = created_at
    this.updated_at = updated_at
    this.sizes = sizes
  }
}

export class Sources {
  device_id: string
  device_type?: string

  constructor(device_id: string, device_type?: string) {
    this.device_id = device_id
    this.device_type = device_type
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
  aggregation_function: string

  constructor(aggregation_function: string) {
    this.aggregation_function = aggregation_function
  }
}

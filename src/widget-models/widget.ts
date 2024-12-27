enum WidgetType {
  Chart = 'chart',
  Table = 'table',
  Map = 'map',
  Gauge = 'gauge',
  Value = 'value',
}

class Widget {
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

class Sources {
  device_id: string
  device_type: string

  constructor(device_id: string, device_type: string) {
    this.device_id = device_id
    this.device_type = device_type
  }
}

class WidgetInfo {
  name: string
  appearance: object | null

  constructor(name: string, appearance: object | null) {
    this.name = name
    this.appearance = appearance
  }
}

class TimeFrame {
  aggregation_function: string

  constructor(aggregation_function: string) {
    this.aggregation_function = aggregation_function
  }
}

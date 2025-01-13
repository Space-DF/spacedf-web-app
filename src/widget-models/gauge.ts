import { AggregationFunction, Sources, TimeFrame } from './widget'

class GaugeTimeFrame extends TimeFrame {
  date_range: string
  is_show_time_frame: boolean
  from: string
  until: string
  resolution: string
  time_zone: string
  constructor(
    date_range: string,
    is_show_time_frame: boolean,
    from: string,
    until: string,
    resolution: string,
    time_zone: string,
    aggregationFunction: AggregationFunction
  ) {
    super(aggregationFunction)
    this.date_range = date_range
    this.is_show_time_frame = is_show_time_frame
    this.from = from
    this.until = until
    this.resolution = resolution
    this.time_zone = time_zone
  }
}

class GaugeSources extends Sources {
  decimal: number
  unit: string
  type: string
  values: object[]
  constructor(
    decimal: number,
    unit: string,
    type: string,
    values: object[],
    device_id: string,
    device_type: string
  ) {
    super(device_id, device_type)
    this.decimal = decimal
    this.unit = unit
    this.type = type
    this.values = values
  }
}

export class Gauge {
  time_frame: GaugeTimeFrame
  sources: GaugeSources

  constructor(time_frame: GaugeTimeFrame, sources: GaugeSources) {
    this.time_frame = time_frame
    this.sources = sources
  }
}

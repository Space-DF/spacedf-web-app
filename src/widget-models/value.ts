/* eslint-disable @typescript-eslint/no-unused-vars */
import { Appearance, Sources, WidgetInfo } from './widget'

class ValueSources extends Sources {
  decimal: string
  unit: string
  type: string
  values: object[]
  constructor(
    decimal: string,
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

class ValueWidgetInfo extends WidgetInfo {
  color: string
  constructor(name: string, appearance: Appearance, color: string) {
    super(name, appearance)
    this.color = color
  }
}

class Value {
  sources: ValueSources
  widget_info: WidgetInfo
  constructor(sources: ValueSources, widget_info: WidgetInfo) {
    this.sources = sources
    this.widget_info = widget_info
  }
}

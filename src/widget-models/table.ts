import { WidgetInfo } from './widget'

class Column {
  column_name: string
  column_type: string
  field: string

  constructor(column_name: string, column_type: string, field: string) {
    this.column_name = column_name
    this.column_type = column_type
    this.field = field
  }
}

class Condition {
  condition_type: string
  text_color: string
  bg_color: string
  is_limit: boolean

  constructor(
    condition_type: string,
    text_color: string,
    bg_color: string,
    is_limit: boolean
  ) {
    this.condition_type = condition_type
    this.text_color = text_color
    this.bg_color = bg_color
    this.is_limit = is_limit
  }
}

export class Table {
  widget_info: WidgetInfo
  conditions: Condition[]
  columns: Column[]

  constructor(
    widget_info: WidgetInfo,
    conditions: Condition[],
    columns: Column[] = []
  ) {
    this.columns = columns
    this.widget_info = widget_info
    this.conditions = conditions
  }
}

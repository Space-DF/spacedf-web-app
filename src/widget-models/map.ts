import { Sources, WidgetInfo } from './widget'

class WidgetMap {
  sources: Sources
  widget_info: WidgetInfo
  constructor(sources: Sources, widget_info: WidgetInfo) {
    this.sources = sources
    this.widget_info = widget_info
  }
}

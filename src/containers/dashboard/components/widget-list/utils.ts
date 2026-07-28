import { Widget } from '@/types/widget'

export const getLayouts = (widgets: Widget[]) => {
  const layout = widgets.map((widget) => ({ ...widget, i: widget.id }))
  return {
    sm: layout,
    md: layout,
    lg: layout,
    xs: layout,
    xxs: layout,
  }
}

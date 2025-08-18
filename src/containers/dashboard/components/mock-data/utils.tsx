import {
  Widget,
  WidgetChart,
  WidgetMap,
  WidgetProgress,
  WidgetTable,
} from '@/types/widget'
import { WidgetType } from '@/widget-models/widget'
import { TextWidget } from './components/widget-text'
import { MapWidget } from './components/widget-map'
import { TableWidget } from './components/widget-table'
import { ValueWidget } from './components/widget-value'
import { MakeRequired } from '@/types/common'
import { ChartWidget } from './components/widget-chart'
import { GaugeWidget } from './components/widget-gauge'
import { WidgetCamera } from './components/widget-camera'
import { WidgetUnit } from './components/widget-unit'
import { WidgetSwitch } from './components/widget-switch'
import { ProgressWidget } from './components/widget-progress'
import { WidgetSensor } from './components/widget-sensor'

export const getWidgetByType = (widget: Widget) => {
  switch (widget.type) {
    case WidgetType.Text:
      return (
        <div key={widget.id}>
          <TextWidget content={widget.content || ''} />
        </div>
      )
    case 'map':
      return (
        <div key={widget.id}>
          <MapWidget {...(widget as WidgetMap)} />
        </div>
      )
    case 'value':
      return (
        <div key={widget.id}>
          <ValueWidget widget={widget} />
        </div>
      )
    case 'table':
      return (
        <div key={widget.id}>
          <TableWidget {...(widget as MakeRequired<WidgetTable>)} />
        </div>
      )
    case 'chart':
      return (
        <div key={widget.id}>
          <ChartWidget {...(widget as WidgetChart)} isShowFullChart />
        </div>
      )
    case 'gauge':
      return (
        <div key={widget.id}>
          <GaugeWidget widget={widget} />
        </div>
      )
    case 'camera':
      return (
        <div key={widget.id}>
          <WidgetCamera title={widget.title!} />
        </div>
      )
    case 'unit':
      return (
        <div key={widget.id}>
          <WidgetUnit {...(widget as MakeRequired<Widget>)} />
        </div>
      )
    case WidgetType.Progress:
      return (
        <div key={widget.id}>
          <ProgressWidget {...(widget as WidgetProgress)} />
        </div>
      )
    case WidgetType.Switch:
      return (
        <div key={widget.id}>
          <WidgetSwitch title={widget.title!} color={widget.color!} />
        </div>
      )
    case WidgetType.Sensor:
      return (
        <div key={widget.id}>
          <WidgetSensor
            title={widget.title!}
            value={widget.value!}
            sensorType={widget.sensor_type}
            color={widget.color}
          />
        </div>
      )
    default:
      return null
  }
}

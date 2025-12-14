import {
  Widget,
  WidgetChart,
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
import { mapPayload, SliderSource } from '@/validator'
import WidgetSlider from './components/widget-slider'
import { WidgetHistogram } from './components/widget-histogram'

export const getWidgetByType = (widget: Widget) => {
  switch (widget.type) {
    case WidgetType.Text:
      return (
        <div key={widget.id}>
          <TextWidget content={widget.content || ''} />
        </div>
      )
    case WidgetType.Map:
      return (
        <div key={widget.id}>
          <MapWidget
            {...(widget as mapPayload)}
            data={[16.05204105833857, 108.2168072245793]}
          />
        </div>
      )
    case WidgetType.Value:
      return (
        <div key={widget.id}>
          <ValueWidget widget={widget} />
        </div>
      )
    case WidgetType.Table:
      return (
        <div key={widget.id}>
          <TableWidget {...(widget as MakeRequired<WidgetTable>)} />
        </div>
      )
    case WidgetType.Chart:
      return (
        <div key={widget.id}>
          <ChartWidget
            {...(widget as WidgetChart)}
            isShowFullChart
            id={widget.id}
          />
        </div>
      )
    case WidgetType.Gauge:
      return (
        <div key={widget.id}>
          <GaugeWidget widget={widget} />
        </div>
      )
    case WidgetType.Camera:
      return (
        <div key={widget.id}>
          <WidgetCamera widget_info={widget.widget_info!} />
        </div>
      )
    case WidgetType.Unit:
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
          <WidgetSwitch
            widget_info={widget.widget_info!}
            color={widget.color!}
            checked={widget.enabled}
          />
        </div>
      )
    case WidgetType.Sensor:
      return (
        <div key={widget.id}>
          <WidgetSensor
            widget_info={widget.widget_info!}
            value={widget.value!}
            sensorType={widget.sensor_type}
            color={widget.color}
          />
        </div>
      )
    case WidgetType.Slider:
      return (
        <div key={widget.id}>
          <WidgetSlider
            widget_info={widget.widget_info!}
            source={widget.source as unknown as MakeRequired<SliderSource>}
            value={widget.value!}
          />
        </div>
      )
    case WidgetType.Histogram:
      return (
        <div key={widget.id}>
          <WidgetHistogram {...(widget as WidgetChart)} id={widget.id} />
        </div>
      )
    default:
      return null
  }
}

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

const getSwitchValue = (value: any) => {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (['on', 'true', '1'].includes(normalized)) return true
    if (['off', 'false', '0'].includes(normalized)) return false
  }
  return !!value
}

export const getWidgetByType = (
  widget: Widget,
  data: any,
  onDelete: (id: string) => void,
  isEdit?: boolean
) => {
  const handleDelete = () => onDelete(widget.widgetId)

  switch (widget.type) {
    case WidgetType.Text:
      return (
        <div key={widget.id}>
          <TextWidget
            content={widget.content || ''}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Map:
      return (
        <div key={widget.id}>
          <MapWidget
            {...(widget as mapPayload)}
            data={data.data}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Value:
      return (
        <div key={widget.id}>
          <ValueWidget
            widget={widget}
            data={data.data}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Table:
      return (
        <div key={widget.id}>
          <TableWidget
            {...(widget as MakeRequired<WidgetTable>)}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Chart:
      return (
        <div key={widget.id}>
          <ChartWidget
            {...(widget as WidgetChart)}
            isShowFullChart
            id={widget.id}
            data={data.data}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Gauge:
      return (
        <div key={widget.id}>
          <GaugeWidget
            widget={widget}
            data={data.data}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Camera:
      return (
        <div key={widget.id}>
          <WidgetCamera
            widget_info={widget.widget_info!}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Unit:
      return (
        <div key={widget.id}>
          <WidgetUnit
            {...(widget as MakeRequired<Widget>)}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Progress:
      return (
        <div key={widget.id}>
          <ProgressWidget
            {...(widget as WidgetProgress)}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Switch:
      return (
        <div key={widget.id}>
          <WidgetSwitch
            widget_info={widget.widget_info!}
            color={widget.color!}
            checked={getSwitchValue(data.data.value)}
            isEdit={isEdit}
            onDelete={handleDelete}
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
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Slider:
      return (
        <div key={widget.id}>
          <WidgetSlider
            widget_info={widget.widget_info!}
            source={widget.source as unknown as MakeRequired<SliderSource>}
            data={data.data}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    case WidgetType.Histogram:
      return (
        <div key={widget.id}>
          <WidgetHistogram
            {...(widget as WidgetChart)}
            id={widget.id}
            isEdit={isEdit}
            onDelete={handleDelete}
          />
        </div>
      )
    default:
      return null
  }
}

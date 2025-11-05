import { WidgetType } from '@/widget-models/widget'
import React from 'react'

import ChartWidget from './components/chart-widget'
import TableWidget from './components/table-widget'
import MapWidget from './components/map-widget'

import GaugeWidget from './components/gauge-widget'
import ValueWidget from './components/value-widget'
import SwitchWidget from './components/switch-widget'
import SliderWidget from './components/slider-widget'
interface Props {
  selectedWidget: WidgetType
  onSaveWidget: () => void
  onClose: () => void
  onBack: () => void
}

const WidgetSelected: React.FC<Props> = ({
  selectedWidget,
  onSaveWidget,
  onClose,
  onBack,
}) => {
  switch (selectedWidget) {
    case WidgetType.Chart:
      return (
        <ChartWidget
          selectedWidget={selectedWidget}
          onClose={onClose}
          onSaveWidget={onSaveWidget}
          onBack={onBack}
        />
      )
    case WidgetType.Gauge:
      return (
        <GaugeWidget
          selectedWidget={selectedWidget}
          onClose={onClose}
          onSaveWidget={onSaveWidget}
          onBack={onBack}
        />
      )
    case WidgetType.Map:
      return (
        <MapWidget
          selectedWidget={selectedWidget}
          onClose={onClose}
          onSaveWidget={onSaveWidget}
          onBack={onBack}
        />
      )
    case WidgetType.Table:
      return (
        <TableWidget
          selectedWidget={selectedWidget}
          onClose={onClose}
          onSaveWidget={onSaveWidget}
          onBack={onBack}
        />
      )
    case WidgetType.Value:
      return (
        <ValueWidget
          selectedWidget={selectedWidget}
          onClose={onClose}
          onSaveWidget={onSaveWidget}
          onBack={onBack}
        />
      )
    case WidgetType.Switch:
      return (
        <SwitchWidget
          selectedWidget={selectedWidget}
          onClose={onClose}
          onSaveWidget={onSaveWidget}
          onBack={onBack}
        />
      )
    case WidgetType.Slider:
      return (
        <SliderWidget
          selectedWidget={selectedWidget}
          onClose={onClose}
          onSaveWidget={onSaveWidget}
          onBack={onBack}
        />
      )
    default:
      return <div>Widget not found</div>
  }
}

export default WidgetSelected

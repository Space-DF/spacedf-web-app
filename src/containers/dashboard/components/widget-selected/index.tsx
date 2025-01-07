import { WidgetType } from '@/widget-models/widget'
import React from 'react'

import ChartWidget from './components/chart-widget'
import TableWidget from './components/table'

interface Props {
  selectedWidget: WidgetType
  onClose: () => void
}

const WidgetSelected: React.FC<Props> = ({ selectedWidget, onClose }) => {
  switch (selectedWidget) {
    case WidgetType.Chart:
      return <ChartWidget selectedWidget={selectedWidget} onClose={onClose} />
    case WidgetType.Gauge:
      return <div>Gauge</div>
    case WidgetType.Map:
      return <div>Map</div>
    case WidgetType.Table:
      return <TableWidget selectedWidget={selectedWidget} onClose={onClose} />
    case WidgetType.Value:
      return <div>Value</div>
    default:
      return <div>Widget not found</div>
  }
}

export default WidgetSelected

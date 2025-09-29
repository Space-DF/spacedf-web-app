import { WidgetContainer, WidgetTitle } from '.'
import { WidgetInfo } from '@/widget-models/widget'

interface WidgetUnitProps {
  widget_info: WidgetInfo
  status?: string
  value: number
  unit: string
}

export const WidgetUnit = ({
  widget_info,
  status,
  value,
  unit,
}: WidgetUnitProps) => {
  return (
    <WidgetContainer className="flex flex-col justify-between">
      <div>
        <WidgetTitle className="font-semibold">{widget_info.name}</WidgetTitle>
        <p>{status}</p>
      </div>
      <div className="flex items-baseline space-x-1">
        <p className="text-brand-component-text-dark text-2xl font-semibold">
          {value}
        </p>
        <p className="text-brand-text-gray">{unit}</p>
      </div>
    </WidgetContainer>
  )
}

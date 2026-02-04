import { Equalizer } from '@/components/icons/equalizer'
import { WidgetContainer, WidgetTitle } from '.'
import { cn } from '@/lib/utils'
import { Distance } from '@/components/icons/distance'
import { Location } from '@/components/icons/location'
import { WidgetInfo } from '@/widget-models/widget'

const getIconBySensorType = (sensorType?: string) => {
  switch (sensorType) {
    case 'chart':
      return Equalizer
    case 'distance':
      return Distance
    case 'location':
      return Location
    default:
      return Equalizer
  }
}

interface WidgetSensorProps {
  widget_info: WidgetInfo
  className?: string
  value: string
  sensorType?: string
  color?: string
}

export const WidgetSensor = ({
  widget_info,
  className,
  value,
  sensorType,
  color,
}: WidgetSensorProps) => {
  const Icon = getIconBySensorType(sensorType)

  return (
    <WidgetContainer className="flex gap-3">
      <div className="relative flex size-7 items-center justify-center rounded-full">
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{ backgroundColor: color }}
        />
        {Icon && (
          <Icon
            className={cn('relative z-10 opacity-100', className)}
            style={{ color }}
          />
        )}
      </div>
      <div>
        <WidgetTitle>{widget_info.name}</WidgetTitle>
        <p className="text-sm capitalize text-brand-component-text-gray">
          {value}
        </p>
      </div>
    </WidgetContainer>
  )
}

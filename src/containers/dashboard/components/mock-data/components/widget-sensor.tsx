import { Equalizer } from '@/components/icons/equalizer'
import { WidgetContainer, WidgetTitle } from '.'
import { cn } from '@/lib/utils'
import { Distance } from '@/components/icons/distance'
import { Location } from '@/components/icons/location'

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

export const WidgetSensor = ({
  title,
  className,
  value,
  sensorType,
  color,
}: {
  title: string
  className?: string
  value: string
  sensorType?: string
  color?: string
}) => {
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
        <WidgetTitle>{title}</WidgetTitle>
        <p className="text-sm capitalize text-brand-component-text-gray">
          {value}
        </p>
      </div>
    </WidgetContainer>
  )
}

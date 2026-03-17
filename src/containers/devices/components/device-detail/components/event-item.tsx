import { BatteryLow, Warning, Temperature, Humidity } from '@/components/icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const getIconConfig = (item: any) => {
  switch (item.type) {
    case 'battery':
      return {
        Icon: BatteryLow,
      }
    case 'humidity':
      return {
        Icon: Humidity,
      }
    case 'temperature':
      return {
        Icon: Temperature,
      }
    case 'geofence_in':
    case 'geofence_out':
    default:
      return {
        Icon: Warning,
      }
  }
}

interface EventItemProps {
  item: any
}

export const EventItem = ({ item }: EventItemProps) => {
  const { Icon } = getIconConfig(item)
  return (
    <div
      key={item.id}
      className={cn(
        'flex items-start gap-2 p-2 rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-light shadow-sm hover:shadow-md transition-all duration-300'
      )}
    >
      <div className="flex items-center justify-center">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-brand-component-text-dark">
            {item.title}
          </div>
        </div>
        <div className="mt-1 flex flex-col gap-y-1">
          <div className="flex items-center gap-x-1">
            <Image
              src={'/images/clock.svg'}
              alt="clock"
              width={16}
              height={16}
            />
            <div className="text-brand-component-text-gray text-xs">
              {item.time}
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            <Image
              src={'/images/map-pin.svg'}
              alt="location"
              width={16}
              height={16}
            />
            <div className="text-brand-component-text-gray text-xs line-clamp-2">
              {item.address}
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            <Image
              src={
                item.source.includes('Automation')
                  ? '/images/flow-arrow.svg'
                  : '/images/square-logo.svg'
              }
              alt="source"
              width={16}
              height={16}
            />
            <div className="text-brand-component-text-gray text-xs">
              {item.source}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

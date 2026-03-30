import { BatteryLow, Warning, Temperature, Humidity } from '@/components/icons'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import { cn } from '@/lib/utils'
import { TelemetryEvent } from '@/types/event'
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
  item: TelemetryEvent
  address?: string | React.ReactNode
}

export const EventItemSkeleton = () => {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-light shadow-sm">
      <div className="flex items-center justify-center">
        <Skeleton className="size-5 rounded-full" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="mt-1 flex flex-col gap-y-1">
          <div className="flex items-center gap-x-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-x-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <div className="flex items-center gap-x-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const EventItem = ({ item, address }: EventItemProps) => {
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
              {item.time_fired}
            </div>
          </div>
          {address && (
            <div className="flex items-center gap-x-1">
              <Image
                src={'/images/map-pin.svg'}
                alt="location"
                width={16}
                height={16}
              />
              <div className="text-brand-component-text-gray text-xs line-clamp-2">
                {address ??
                  `${item.location?.latitude}, ${item.location?.longitude}`}
              </div>
            </div>
          )}
          <div className="flex items-center gap-x-1">
            <Image
              src={
                item.automation
                  ? '/images/flow-arrow.svg'
                  : '/images/square-logo.svg'
              }
              alt="source"
              width={16}
              height={16}
            />
            <div className="text-brand-component-text-gray text-xs">
              From {item.automation ? 'Automation' : 'Geofence'}{' '}
              {item.automation?.name ?? item.geofence?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

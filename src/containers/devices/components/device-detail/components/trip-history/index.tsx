import ExpandableList from '@/components/common/expandable-list'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/utils/time'

import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import TripDetail from './components/trip-detail'
import { useDeviceStore } from '@/stores/device-store'
import { useShallow } from 'zustand/react/shallow'
import { useDeviceHistory } from '@/hooks/useDeviceHistory'

const RANGE_VALUES = [
  {
    value: 'recently',
    label: 'Recently',
  },
  {
    value: 'last_week',
    label: 'Last Week',
  },
  {
    value: 'last_month',
    label: 'Last Month',
  },
  {
    value: 'last_year',
    label: 'Last Year',
  },
]

interface ListItem {
  id: number
  name: string
  distance: number
  duration: number
  time: Date
}

const TRIP_HISTORY: ListItem[] = [
  {
    id: 1,
    name: 'Morning Commute',
    distance: 14.5,
    duration: 3600000, // 1 hour
    time: new Date('2024-03-20T08:30:00'),
  },
  {
    id: 2,
    name: 'Evening Return',
    distance: 15.2,
    duration: 3900000, // 1 hour 5 minutes
    time: new Date('2024-03-20T17:45:00'),
  },
  {
    id: 3,
    name: 'Weekend Trip',
    distance: 45.8,
    duration: 7200000, // 2 hours
    time: new Date('2024-03-18T10:15:00'),
  },
  {
    id: 4,
    name: 'Grocery Run',
    distance: 8.3,
    duration: 1800000, // 30 minutes
    time: new Date('2024-03-19T15:20:00'),
  },
  {
    id: 5,
    name: 'Business Meeting',
    distance: 22.4,
    duration: 4500000, // 1 hour 15 minutes
    time: new Date('2024-03-17T09:00:00'),
  },
]

const INITIAL_VISIBLE_COUNT = 2

const TripHistory = () => {
  const t = useTranslations('common')
  const [selectedTrip, setSelectedTrip] = useState<ListItem>()
  const { deviceSelected } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
    }))
  )

  const { startDrawHistory } = useDeviceHistory()

  const handleStartDrawHistory = (item: ListItem) => {
    startDrawHistory(deviceSelected)
    setSelectedTrip(item)
  }

  const renderTripHistoryItem = useCallback(
    (item: ListItem, index: number, isExpanded: boolean) => {
      return (
        <div
          key={item.id}
          className={cn(
            'border border-brand-component-stroke-dark-soft rounded-md p-2 bg-brand-component-fill-light cursor-pointer shadow-sm hover:shadow-md transition-all duration-200',
            isExpanded
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4'
          )}
          onClick={() => handleStartDrawHistory(item)}
          style={{
            transitionDelay: isExpanded ? `${index * 100}ms` : '0ms',
          }}
        >
          <div className="flex items-start gap-x-2">
            <Image
              src={'/images/map.svg'}
              alt="map-pin"
              width={73}
              height={73}
              className="rounded-md"
            />
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-col gap-y-1">
                <span className="text-brand-component-text-dark text-sm font-semibold">
                  {item.name}
                </span>
                <span className="text-xs text-brand-component-stroke-gray">
                  {format(item.time, 'HH:mm dd/MM/yyyy')}
                </span>
              </div>
              <div className="flex gap-x-9">
                <div className="flex flex-col gap-y-1">
                  <p className="text-[14px] font-semibold text-brand-component-text-dark">
                    {item.distance} km
                  </p>
                  <span className="text-[11px] text-brand-component-stroke-gray">
                    {t('distance')}
                  </span>
                </div>
                <div className="flex flex-col gap-y-1">
                  <p className="text-[14px] font-semibold text-brand-component-text-dark">
                    {formatDuration(item.duration)}
                  </p>
                  <span className="text-[11px] text-brand-component-stroke-gray">
                    {t('duration')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    []
  )

  return (
    <>
      <TripDetail
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(undefined)}
      />
      <div className="flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <Label className="text-brand-component-text-dark text-sm font-semibold">
            {t('trip_history')}
          </Label>
          <div className="flex items-center gap-2">
            <Select defaultValue="recently">
              <SelectTrigger
                icon={<ChevronDown className="size-4" />}
                className="bg-brand-component-fill-dark-soft dark:bg-brand-component-fill-light rounded-lg border-none outline-none focus:ring-0 min-w-28 h-6"
              >
                <SelectValue
                  placeholder="Select range time"
                  className="min-w-30 h-6"
                />
              </SelectTrigger>
              <SelectContent>
                {RANGE_VALUES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ExpandableList
          items={TRIP_HISTORY}
          initialCount={INITIAL_VISIBLE_COUNT}
          renderItem={renderTripHistoryItem}
        />
      </div>
    </>
  )
}

export default TripHistory

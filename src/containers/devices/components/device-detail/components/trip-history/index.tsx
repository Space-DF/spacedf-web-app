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
import { useCallback, useMemo, useState } from 'react'
import TripDetail from './components/trip-detail'
import { useDeviceStore } from '@/stores/device-store'
import { useDeviceHistory } from '@/hooks/useDeviceHistory'
import { useGetTrips } from './hooks/useGetTrips'
import { calculateTotalDistance } from '@/utils/map'
import { Checkpoint } from '@/types/trip'
import { useGetDevices } from '@/hooks/useDevices'

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
  id: string
  name: string
  distance: string
  duration: number
  time: Date
  checkpoints: Checkpoint[]
}

const INITIAL_VISIBLE_COUNT = 2

const TripHistory = () => {
  const t = useTranslations('common')
  const [selectedTrip, setSelectedTrip] = useState<ListItem>()
  const { data: devices } = useGetDevices()
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)

  const currentDeviceId = useMemo(() => {
    const currentDeviceSpace = devices?.find(
      (device) => device.id === deviceSelected
    )
    return currentDeviceSpace?.device.id
  }, [devices, deviceSelected])

  const { data: trips } = useGetTrips(currentDeviceId)

  const tripHistory: ListItem[] =
    trips?.map((trip) => ({
      id: trip.id,
      name: 'Weekend Trip',
      checkpoints: trip.checkpoints,
      distance: calculateTotalDistance(trip.checkpoints),
      duration: trip.checkpoints.reduce((acc, checkpoint) => {
        return (
          acc +
          (new Date(checkpoint.timestamp).getTime() -
            new Date(trip.started_at).getTime())
        )
      }, 0),
      time: new Date(trip.started_at),
    })) || []

  const { startDrawHistory } = useDeviceHistory()

  const handleStartDrawHistory = (item: ListItem) => {
    startDrawHistory(item.checkpoints)
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
        checkpoints={selectedTrip?.checkpoints}
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
          items={tripHistory}
          initialCount={INITIAL_VISIBLE_COUNT}
          renderItem={renderTripHistoryItem}
        />
      </div>
    </>
  )
}

export default TripHistory

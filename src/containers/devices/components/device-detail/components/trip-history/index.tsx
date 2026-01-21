import ExpandableList from '@/components/common/expandable-list'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/utils/time'

import { format } from 'date-fns'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCallback, useMemo, useState } from 'react'
import TripDetail from './components/trip-detail'
import { useDeviceStore } from '@/stores/device-store'
import { useGetTrips } from './hooks/useGetTrips'
import { Checkpoint } from '@/types/trip'
import dayjs from 'dayjs'
import { useTripAddress } from './hooks/useTripAddress'

interface ListItem {
  id: string
  name: string | React.ReactNode
  distance: string
  duration: number
  time?: Date
  checkpoints: Checkpoint[]
}

const INITIAL_VISIBLE_COUNT = 2

const TripHistoryItemSkeleton = ({ isExpanded }: { isExpanded: boolean }) => {
  return (
    <div
      className={cn(
        'border border-brand-component-stroke-dark-soft rounded-md p-2 bg-brand-component-fill-light shadow-sm transition-all duration-200',
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}
    >
      <div className="flex items-start gap-x-2">
        <Skeleton className="w-[73px] h-[73px] rounded-md" />
        <div className="flex flex-col gap-y-3 flex-1">
          <div className="flex flex-col gap-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex gap-x-9">
            <div className="flex flex-col gap-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex flex-col gap-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const TripHistory = () => {
  const t = useTranslations('common')
  const [selectedTrip, setSelectedTrip] = useState<string>()
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)

  const { data: trips = [], isLoading, mutate } = useGetTrips(deviceSelected)

  const listLocation: [number, number][] = useMemo(() => {
    return trips.map((trip) => [trip.last_longitude, trip.last_latitude])
  }, [trips])

  const { data: tripAddresses } = useTripAddress(listLocation)

  const tripHistory: ListItem[] = useMemo(
    () =>
      trips?.map((trip, index) => ({
        id: trip.id,
        name: tripAddresses?.[index].features[0].place_name || (
          <Skeleton className="w-20 h-4" />
        ),
        checkpoints: trip.checkpoints,
        distance: '0',
        duration: dayjs(trip.last_report).diff(dayjs(trip.started_at)),
        time: trip.last_report ? new Date(trip.last_report) : undefined,
      })) || [],
    [trips, tripAddresses]
  )

  const handleStartDrawHistory = (item: ListItem) => {
    setSelectedTrip(item.id)
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
                <span className="text-brand-component-text-dark text-sm font-semibold line-clamp-1">
                  {item.name}
                </span>
                <span className="text-xs text-brand-component-stroke-gray">
                  {item.time
                    ? format(item.time, 'HH:mm dd/MM/yyyy')
                    : 'Unknown'}
                </span>
              </div>
              <div className="flex gap-x-9">
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
    [t]
  )

  const handleCloseTripDetail = () => {
    setSelectedTrip(undefined)
    mutate()
  }

  return (
    <>
      <TripDetail
        open={!!selectedTrip}
        onClose={handleCloseTripDetail}
        tripId={selectedTrip}
      />
      <div className="flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <Label className="text-brand-component-text-dark text-sm font-semibold">
            {t('trip_history')}
          </Label>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: INITIAL_VISIBLE_COUNT }).map((_, index) => (
              <TripHistoryItemSkeleton key={index} isExpanded />
            ))}
          </div>
        ) : (
          <ExpandableList
            items={tripHistory}
            initialCount={INITIAL_VISIBLE_COUNT}
            renderItem={renderTripHistoryItem}
          />
        )}
      </div>
    </>
  )
}

export default TripHistory

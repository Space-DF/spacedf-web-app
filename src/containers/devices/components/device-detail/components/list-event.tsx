import React, { useCallback, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import ExpandableList from '@/components/common/expandable-list'
import { useShowDummyData } from '@/hooks/useShowDummyData'
import { useEvents } from '../hooks/useEvents'
import { useDeviceStore } from '@/stores/device-store'
import dayjs from 'dayjs'
import { useTripAddress } from './trip-history/hooks/useTripAddress'
import { Skeleton } from '@/components/ui/skeleton'

const DATE_VALUES = [
  {
    label: 'Today',
    value: 'today',
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
  },
  {
    label: 'Last 7 days',
    value: 'last_7_days',
  },
  {
    label: 'Last 30 days',
    value: 'last_30_days',
  },
  {
    label: 'Last 90 days',
    value: 'last_90_days',
  },
]

const LIST_EVENT = [
  {
    id: 1,
    title: 'Device back online',
    status: 'online',
    times: '03:00 PM - 04:00 PM',
    location: 'Tran Phu, Danang',
  },
  {
    id: 2,
    title: 'Device Offline',
    status: 'offline',
    times: '03:00 PM - 04:00 PM',
    location: 'Yen Bai, Danang',
  },
  {
    id: 5,
    title: 'Device restarted',
    status: 'info',
    times: '01:00 PM - 02:00 PM',
    location: 'An Giang, Ho Chi Minh',
  },
  {
    id: 6,
    title: 'Firmware update completed',
    status: 'online',
    times: '12:15 PM - 01:15 PM',
    location: 'Ho Chi Minh, Ho Chi Minh',
  },
]

interface ListItem {
  id: string
  // title: string
  status: string
  times: string
  location: string
}

const INITIAL_VISIBLE_COUNT = 2

const skeletonItems = Array.from(
  { length: INITIAL_VISIBLE_COUNT },
  (_, index) => ({
    id: `skeleton-${index}`,
    status: 'loading',
    times: '',
    location: '',
  })
)

const ListEvent = () => {
  const t = useTranslations('common')

  const showDummyData = useShowDummyData()

  const deviceDataSelected = useDeviceStore(
    (state) => state.devices[state.deviceSelected]
  )

  const { data: events, isLoading: isLoadingEvents } = useEvents(
    deviceDataSelected?.deviceId
  )

  const listLocation = useMemo(() => {
    return events?.map((event) => ({
      latitude: event.latitude,
      longitude: event.longitude,
    }))
  }, [events])

  const { data: listLocationName = [], isLoading: isLoadingLocation } =
    useTripAddress(listLocation)

  const listEvent = useMemo(
    () =>
      showDummyData
        ? LIST_EVENT
        : events?.map((event, index) => ({
            id: event.timestamp,
            status: 'online',
            times: dayjs(event.timestamp).format('HH:mm'),
            location: isLoadingLocation ? (
              <Skeleton className="w-20 h-4" />
            ) : (
              listLocationName[index] || 'Unknown location'
            ),
          })),
    [events, showDummyData, isLoadingLocation, listLocationName]
  )

  const renderSkeletonItem = useCallback(
    (item: ListItem) => (
      <div
        key={item.id}
        className="flex items-start gap-2 p-2 rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-light shadow-sm"
      >
        <Skeleton className="size-6 rounded-full" />
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-1">
              <Skeleton className="size-4" />
              <Skeleton className="w-16 h-3" />
            </div>
            <div className="flex items-center gap-x-1">
              <Skeleton className="size-4" />
              <Skeleton className="w-32 h-3" />
            </div>
          </div>
        </div>
      </div>
    ),
    []
  )

  const renderEventItem = useCallback(
    (item: ListItem, index: number, isExpanded: boolean) => (
      <div
        key={item.id}
        className={cn(
          'flex items-start gap-2 p-2 rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-light shadow-sm hover:shadow-md transition-all duration-300',
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        )}
      >
        <div className="p-[4px] bg-brand-component-fill-light rounded-full border border-brand-component-stroke-dark-soft dark:bg-brand-component-fill-positive-dark">
          {item.status === 'online' ? (
            <div className="size-4 rounded-full bg-brand-component-fill-positive" />
          ) : (
            <Image
              src={'/images/cloud-dash.svg'}
              alt="offline"
              width={16}
              height={16}
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          {/* <div className="text-sm font-medium text-brand-component-text-dark">
            {item.title}
          </div> */}
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-1">
              <Image
                src={'/images/clock.svg'}
                alt="clock"
                width={16}
                height={16}
              />
              <div className="text-brand-component-text-gray text-xs">
                {item.times}
              </div>
            </div>
            <div className="flex items-center gap-x-1">
              <Image
                src={'/images/map-pin.svg'}
                alt="clock"
                width={16}
                height={16}
              />
              <div className="text-brand-component-text-gray text-xs">
                {item.location}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [t]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-brand-component-text-dark text-sm font-semibold">
          {t('events')}
        </Label>
        <div className="flex items-center gap-2">
          <Select defaultValue="today">
            <SelectTrigger
              icon={<ChevronDown className="size-4" />}
              className="bg-brand-component-fill-dark-soft dark:bg-brand-component-fill-light rounded-lg border-none outline-none focus:ring-0 min-w-28 h-6"
            >
              <SelectValue placeholder="Select date" className="min-w-30 h-6" />
            </SelectTrigger>
            <SelectContent>
              {DATE_VALUES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoadingEvents ? (
        <div className="flex flex-col gap-2">
          {skeletonItems.map((item) => renderSkeletonItem(item))}
        </div>
      ) : (
        <ExpandableList
          items={listEvent as ListItem[]}
          initialCount={INITIAL_VISIBLE_COUNT}
          renderItem={renderEventItem}
        />
      )}
    </div>
  )
}

export default ListEvent

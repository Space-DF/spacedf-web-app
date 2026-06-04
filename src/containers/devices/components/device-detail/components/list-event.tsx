import React, { useCallback, useMemo, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import { InputWithIcon } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Nodata } from '@/components/ui/no-data'
import { EventItem, EventItemSkeleton } from './event-item'
import { Slide } from '@/components/ui/slide'
import { AllEvent } from './all-event'
import { useEvents } from '../hooks/useEvents'
import { useTripAddress } from './trip-history/hooks/useTripAddress'
import { useEventStore } from '../stores/event'
import { mergeEvents } from '@/containers/devices/utils'
import { useDebounce } from '@/hooks'

interface ListEventProps {
  deviceId: string
}

const ListEvent = ({ deviceId }: ListEventProps) => {
  const t = useTranslations('event')
  const [searchValue, setSearchValue] = useState('')
  const searchDebouncedValue = useDebounce(searchValue, 500)
  const [openAllEvent, setOpenAllEvent] = useState(false)
  const { data: events, isLoading } = useEvents(deviceId, searchDebouncedValue)

  const eventDevices = useEventStore(
    (state) => state.eventDevices[deviceId] ?? []
  )

  const fullDeviceEvents = useMemo(() => {
    const eventResults = events?.results ?? []
    if (!eventDevices.length) return eventResults
    return mergeEvents(eventDevices, eventResults, searchDebouncedValue)
  }, [eventDevices, events?.results, searchDebouncedValue])

  const { validLocations, addressIndexByEventIndex } = useMemo(() => {
    const validLocations: [number, number][] = []
    const addressIndexByEventIndex: Record<number, number> = {}

    fullDeviceEvents.forEach((e, eventIndex) => {
      const longitude = e.location?.longitude
      const latitude = e.location?.latitude

      if (typeof longitude !== 'number' || typeof latitude !== 'number') return

      addressIndexByEventIndex[eventIndex] = validLocations.length
      validLocations.push([longitude, latitude])
    })

    return { validLocations, addressIndexByEventIndex }
  }, [fullDeviceEvents])

  const { data: addresses, isLoading: isLoadingAddresses } =
    useTripAddress(validLocations)

  const getAddress = useCallback(
    (index: number) => {
      if (isLoadingAddresses) return <Skeleton className="h-3 w-32" />
      const addressIndex = addressIndexByEventIndex[index]
      if (addressIndex === undefined) return undefined
      const placeName = addresses?.[addressIndex]?.features?.[0]?.place_name
      return placeName && placeName.trim() ? placeName : 'Unknown'
    },
    [addresses, isLoadingAddresses, addressIndexByEventIndex]
  )

  return (
    <div className="flex flex-col gap-3 bg-background">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Label className="text-brand-component-text-dark text-sm font-semibold">
            {t('events')}
          </Label>
          {isLoading ? (
            <Skeleton className="h-[18px] w-8 rounded-full" />
          ) : (
            <span className="rounded-full bg-brand-component-fill-negative px-2 py-[2px] text-[11px] font-semibold text-brand-component-text-light">
              {fullDeviceEvents.length > 9 ? '10+' : fullDeviceEvents.length}
            </span>
          )}
        </div>
        <Button
          className="p-1 h-fit flex items-center gap-1 rounded-md leading-4"
          onClick={() => setOpenAllEvent(true)}
        >
          {t('see_all')} <ChevronRight className="size-4 p-0" />
        </Button>
      </div>
      <InputWithIcon
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search for events"
        prefixCpn={<Search size={14} className="text-muted-foreground" />}
        wrapperClass="w-full"
      />
      <div className="space-y-1">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <EventItemSkeleton key={index} />
            ))}
          </div>
        ) : fullDeviceEvents.length === 0 ? (
          <Nodata content={t('no_events')} />
        ) : (
          fullDeviceEvents.map((item, index) => (
            <EventItem item={item} key={item.id} address={getAddress(index)} />
          ))
        )}
      </div>

      <Slide
        className="w-full bg-background p-0"
        open={openAllEvent}
        direction="right"
        size="100%"
        contentClassName="p-4"
        showCloseButton={false}
      >
        <AllEvent deviceId={deviceId} onClose={() => setOpenAllEvent(false)} />
      </Slide>
    </div>
  )
}

export default ListEvent

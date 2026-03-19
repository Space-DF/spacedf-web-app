import React, { useMemo, useState } from 'react'
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

interface ListEventProps {
  deviceId: string
}

const ListEvent = ({ deviceId }: ListEventProps) => {
  const t = useTranslations('event')
  const [searchValue, setSearchValue] = useState('')
  const [openAllEvent, setOpenAllEvent] = useState(false)
  const { data: events, isLoading } = useEvents(deviceId, searchValue)

  const filteredEvents = useMemo(() => events?.results ?? [], [events])

  const locations: [number, number][] = useMemo(
    () =>
      filteredEvents
        .filter((e) => e.location)
        .map((e) => [e.location!.longitude, e.location!.latitude]),
    [filteredEvents]
  )

  const { data: addresses, isLoading: isLoadingAddresses } =
    useTripAddress(locations)

  const getAddress = (index: number) => {
    if (isLoadingAddresses) return <Skeleton className="h-3 w-32" />
    return addresses?.[index]?.features?.[0]?.place_name ?? 'Unknown'
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Label className="text-brand-component-text-dark text-sm font-semibold">
            {t('events')}
          </Label>
          {isLoading ? (
            <Skeleton className="h-[18px] w-8 rounded-full" />
          ) : (
            <span className="rounded-full bg-brand-component-fill-negative px-2 py-[2px] text-[11px] font-semibold text-brand-component-text-light">
              {filteredEvents.length > 9 ? '10+' : filteredEvents.length}
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
        prefixCpn={<Search size={14} />}
        wrapperClass="w-full"
      />
      <div className="space-y-1">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <EventItemSkeleton key={index} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Nodata content={t('no_events')} />
        ) : (
          filteredEvents.map((item, index) => (
            <EventItem item={item} key={item.id} address={getAddress(index)} />
          ))
        )}
      </div>

      <Slide
        className="w-full bg-brand-fill-surface dark:bg-brand-fill-outermost p-0"
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

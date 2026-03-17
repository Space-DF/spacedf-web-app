import React, { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronLeft, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { InputWithIcon } from '@/components/ui/input'
import { EventItem } from '../event-item'

interface AllEventItem {
  id: string
  title: string
  type: 'battery' | 'humidity' | 'temperature' | 'geofence_in' | 'geofence_out'
  level: 'info' | 'warning' | 'critical'
  time: string
  address: string
  source: string
}

const BASE_EVENTS: AllEventItem[] = [
  {
    id: '1',
    title: '20% battery remaining',
    type: 'battery',
    level: 'critical',
    time: '03:00 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Automation ABC',
  },
  {
    id: '2',
    title: 'Humidity at 28%',
    type: 'humidity',
    level: 'info',
    time: '03:05 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Automation ABC',
  },
  {
    id: '3',
    title: 'Temperature at 42°C',
    type: 'temperature',
    level: 'warning',
    time: '03:10 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Automation ABC',
  },
  {
    id: '4',
    title: 'Device entered restricted area',
    type: 'geofence_in',
    level: 'critical',
    time: '03:15 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Geofence ABC',
  },
  {
    id: '5',
    title: 'Device exited Safe Zone',
    type: 'geofence_out',
    level: 'warning',
    time: '03:20 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Geofence ABC',
  },
]

const generateMockEvents = (page: number, pageSize: number): AllEventItem[] => {
  const events: AllEventItem[] = []

  for (let i = 0; i < pageSize; i++) {
    const base = BASE_EVENTS[i % BASE_EVENTS.length]
    const index = page * pageSize + i + 1

    events.push({
      ...base,
      id: `${base.id}-${index}`,
      time: base.time,
      title: base.title,
    })
  }

  return events
}

const PAGE_SIZE = 10

interface AllEventProps {
  onClose: () => void
}

export const AllEvent = ({ onClose }: AllEventProps) => {
  const t = useTranslations('event')
  const [searchValue, setSearchValue] = useState('')
  const [events] = useState<AllEventItem[]>(() =>
    generateMockEvents(0, PAGE_SIZE)
  )
  const [hasMore] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        event.title.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [events, searchValue]
  )

  const rowVirtualizer = useVirtualizer({
    count: filteredEvents.length + (hasMore ? 1 : 0),
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 122,
    overscan: 5,
  })

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center">
          <ChevronLeft
            className="size-6  cursor-pointer text-brand-component-text-gray"
            onClick={onClose}
          />
          <Label className="text-brand-component-text-dark text-sm font-semibold">
            {t('events')}
          </Label>
        </div>
      </div>

      <InputWithIcon
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search for events"
        prefixCpn={<Search size={14} />}
        wrapperClass="w-full"
      />

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pr-1">
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: 'relative',
            width: '100%',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const isLoaderRow =
              hasMore && virtualRow.index === filteredEvents.length
            const item = filteredEvents[virtualRow.index]

            return (
              <div
                key={isLoaderRow ? 'loader' : item.id}
                ref={isLoaderRow ? loadingRef : undefined}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoaderRow ? (
                  <div className="flex items-center justify-center py-3 text-xs text-brand-component-text-gray">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-component-text-gray border-t-transparent" />
                  </div>
                ) : (
                  <EventItem item={item} />
                )}
              </div>
            )
          })}
          {!hasMore && filteredEvents.length > 0 && (
            <div className="flex items-center justify-center py-3 text-xs text-brand-component-text-gray">
              {t('no_more_events')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import { InputWithIcon } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EventItem } from './event-item'
import { Slide } from '@/components/ui/slide'
import { AllEvent } from './all-event'

interface ListItem {
  id: string
  title: string
  type: 'battery' | 'humidity' | 'temperature' | 'geofence_in' | 'geofence_out'
  level: 'info' | 'warning' | 'critical'
  time: string
  address: string
  source: string
}

const MOCK_EVENTS: ListItem[] = [
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
    time: '03:00 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Automation ABC',
  },
  {
    id: '3',
    title: 'Temperature at 42°C',
    type: 'temperature',
    level: 'warning',
    time: '03:00 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Automation ABC',
  },
  {
    id: '4',
    title: 'Device entered restricted area',
    type: 'geofence_in',
    level: 'critical',
    time: '03:00 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Geofence ABC',
  },
  {
    id: '5',
    title: 'Device exited Safe Zone',
    type: 'geofence_out',
    level: 'warning',
    time: '03:00 PM',
    address: '238 Trung Nu ward, Binh Thuan ward, Hai Chau district, Danang',
    source: 'From Geofence ABC',
  },
]

const ListEvent = () => {
  const t = useTranslations('event')
  const [searchValue, setSearchValue] = useState('')
  const [openAllEvent, setOpenAllEvent] = useState(false)

  const filteredEvents = useMemo(
    () =>
      MOCK_EVENTS.filter((event) =>
        event.title.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Label className="text-brand-component-text-dark text-sm font-semibold">
            {t('events')}
          </Label>
          <span className="rounded-full bg-brand-component-fill-negative px-2 py-[2px] text-[11px] font-semibold text-brand-component-text-light">
            {filteredEvents.length > 9 ? '10+' : filteredEvents.length}
          </span>
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
        {filteredEvents.map((item) => (
          <EventItem item={item} key={item.id} />
        ))}
      </div>

      <Slide
        className="w-full bg-brand-fill-surface dark:bg-brand-fill-outermost p-0"
        open={openAllEvent}
        direction="right"
        size="100%"
        contentClassName="p-4"
        showCloseButton={false}
      >
        <AllEvent onClose={() => setOpenAllEvent(false)} />
      </Slide>
    </div>
  )
}

export default ListEvent

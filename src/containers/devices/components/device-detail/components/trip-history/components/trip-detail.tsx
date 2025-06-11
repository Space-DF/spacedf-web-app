import { RightSideBarLayout } from '@/components/ui'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slide } from '@/components/ui/slide'
import {
  Timeline,
  TimelineContent,
  TimelineLine,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
} from '@/components/ui/timeline'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, ChevronDown, Clock, Ellipsis, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'

const TRIP_HISTORY = [
  {
    id: 1,
    title: 'Start',
    address: '789 Market Street, San Francisco, CA 94103',
    start: '2024-03-15 08:30:00',
    end: '2024-03-15 08:30:00',
    date: '2024-03-15',
  },
  {
    id: 2,
    title: 'Stop',
    address: '123 Mission Street, San Francisco, CA 94105',
    start: '2024-03-15 08:45:00',
    end: '2024-03-15 09:15:00',
    date: '2024-03-15',
  },
  {
    id: 3,
    title: 'Start',
    address: '456 Howard Street, San Francisco, CA 94105',
    start: '2024-03-15 09:30:00',
    end: '2024-03-15 09:30:00',
    date: '2024-03-15',
  },
  {
    id: 4,
    title: 'Stop',
    address: '321 Folsom Street, San Francisco, CA 94105',
    start: '2024-03-15 10:00:00',
    end: '2024-03-15 10:45:00',
    date: '2024-03-15',
  },
  {
    id: 5,
    title: 'Start',
    address: '654 Bryant Street, San Francisco, CA 94107',
    start: '2024-03-15 11:00:00',
    end: '2024-03-15 11:00:00',
    date: '2024-03-15',
  },
  {
    id: 6,
    title: 'Stop',
    address: '987 Harrison Street, San Francisco, CA 94107',
    start: '2024-03-15 11:30:00',
    end: '2024-03-15 12:15:00',
    date: '2024-03-15',
  },
]

interface TripDetailProps {
  open: boolean
  onClose: () => void
}

const TripDetail = ({ open, onClose }: TripDetailProps) => {
  const t = useTranslations('common')
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleTrip = isExpanded ? TRIP_HISTORY : TRIP_HISTORY.slice(0, 3)
  return (
    <Slide
      className="w-full bg-brand-fill-surface dark:bg-brand-fill-outermost p-0"
      open={open}
      showCloseButton={false}
      direction="right"
      size="100%"
      contentClassName="p-0"
      onClose={onClose}
    >
      <RightSideBarLayout
        onClose={onClose}
        className="h-full relative"
        title={
          <div className="flex size-full items-center gap-2">
            <ArrowLeft size={20} className="cursor-pointer" onClick={onClose} />
            <div>{t('timeline')}</div>
          </div>
        }
        allowClose={false}
      >
        <ScrollArea className="h-full mt-4">
          <Timeline>
            {visibleTrip.map((item, index) => {
              const isLast = index === visibleTrip.length - 1
              return (
                <TimelineItem status="done" key={item.id}>
                  <TimelineHeading className="w-full flex items-center justify-between">
                    <p className="text-brand-component-text-dark font-semibold text-sm">
                      {item.title}
                    </p>
                    <Ellipsis className="size-[18px] cursor-pointer text-brand-component-text-gray" />
                  </TimelineHeading>
                  <TimelineDot
                    status="custom"
                    className="bg-brand-component-fill-dark dark:bg-brand-component-fill-secondary border-none size-6"
                    customIcon={
                      index === TRIP_HISTORY.length - 1 ? (
                        <MapPin className="size-4 text-white" />
                      ) : (
                        <Image
                          src={'/images/flag.svg'}
                          alt="flag"
                          width={16}
                          height={16}
                        />
                      )
                    }
                  />
                  {!isLast && <TimelineLine done />}
                  <TimelineContent className="text-xs text-brand-component-text-gray">
                    <div className="flex flex-col space-y-1">
                      <div>{item.address}</div>
                      <div className="flex items-center space-x-1">
                        <Clock className="size-4" />
                        <p>
                          {format(item.start, 'hh:mm a')} -{' '}
                          {format(item.end, 'hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      {format(item.date, 'EEEE dd MMMM yyyy')}
                    </div>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
          <button
            className="w-full border-none p-2 flex items-center justify-center gap-x-1 text-brand-component-text-dark text-sm font-medium"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <p>{isExpanded ? 'Less' : 'More'}</p>{' '}
            <ChevronDown
              className={cn(
                'size-5 transition-transform duration-300',
                isExpanded ? 'rotate-180' : ''
              )}
            />
          </button>
        </ScrollArea>
      </RightSideBarLayout>
    </Slide>
  )
}

export default TripDetail

import { Nodata, RightSideBarLayout } from '@/components/ui'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Slide } from '@/components/ui/slide'
import {
  Timeline,
  TimelineContent,
  TimelineLine,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
} from '@/components/ui/timeline'
import { useDeviceHistory } from '@/hooks/useDeviceHistory'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, ChevronDown, Clock, Ellipsis, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'
import { useGetTrip } from '../hooks/useGetTrip'
import { Checkpoint } from '@/types/trip'
interface TripDetailProps {
  open: boolean
  onClose: () => void
  tripId?: string
}

const TimelineSkeleton = () => {
  return (
    <Timeline>
      {[1, 2, 3].map((item) => (
        <TimelineItem status="done" key={item}>
          <TimelineHeading className="w-full flex items-center justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="size-[18px] rounded-full" />
          </TimelineHeading>
          <TimelineDot
            status="custom"
            className="bg-muted border-none size-6"
            customIcon={<Skeleton className="size-4 rounded-full" />}
          />
          {item !== 3 && <TimelineLine done />}
          <TimelineContent className="text-xs">
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center space-x-1">
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-3 w-48 mt-3" />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

const TripDetail = ({ open, onClose, tripId }: TripDetailProps) => {
  const t = useTranslations('common')
  const [isExpanded, setIsExpanded] = useState(false)

  const { data: trip, isLoading } = useGetTrip(tripId)

  const checkpoints = trip?.checkpoints || []

  const visibleCheckpoints: Checkpoint[] = isExpanded
    ? checkpoints
    : checkpoints.slice(0, 3)

  const { removeRoute } = useDeviceHistory()

  const handleClose = () => {
    removeRoute()
    onClose()
  }

  return (
    <Slide
      className="w-full bg-brand-fill-surface dark:bg-brand-fill-outermost p-0"
      open={open}
      showCloseButton={false}
      direction="right"
      size="100%"
      contentClassName="p-0"
      onClose={handleClose}
    >
      <RightSideBarLayout
        onClose={onClose}
        className="h-full relative"
        title={
          <div className="flex size-full items-center gap-2">
            <ArrowLeft
              size={20}
              className="cursor-pointer"
              onClick={handleClose}
            />
            <div>{t('timeline')}</div>
          </div>
        }
        allowClose={false}
      >
        {!isLoading && visibleCheckpoints.length === 0 && <Nodata />}
        <ScrollArea className="h-full mt-4">
          {isLoading ? (
            <TimelineSkeleton />
          ) : (
            <Timeline>
              {visibleCheckpoints.map((item, index) => {
                const isLast = index === visibleCheckpoints.length - 1
                return (
                  <TimelineItem status="done" key={item.timestamp}>
                    <TimelineHeading className="w-full flex items-center justify-between">
                      <p className="text-brand-component-text-dark font-semibold text-sm">
                        {isLast ? 'Stop' : 'Start'}
                      </p>
                      <Ellipsis className="size-[18px] cursor-pointer text-brand-component-text-gray" />
                    </TimelineHeading>
                    <TimelineDot
                      status="custom"
                      className="bg-brand-component-fill-dark dark:bg-brand-component-fill-secondary border-none size-6"
                      customIcon={
                        index === checkpoints.length - 1 ? (
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
                        <div>238 Trung Nu Vuong, Hai Chau, Da Nang</div>
                        <div className="flex items-center space-x-1">
                          <Clock className="size-4" />
                          <p>
                            {format(item.timestamp, 'hh:mm a')} -{' '}
                            {format(item.timestamp, 'hh:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        {format(item.timestamp, 'EEEE dd MMMM yyyy')}
                      </div>
                    </TimelineContent>
                  </TimelineItem>
                )
              })}
            </Timeline>
          )}
          {!isLoading && checkpoints.length > 3 && (
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
          )}
        </ScrollArea>
      </RightSideBarLayout>
    </Slide>
  )
}

export default TripDetail

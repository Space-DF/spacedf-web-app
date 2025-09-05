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
import { useDeviceHistory } from '@/hooks/useDeviceHistory'
import { cn } from '@/lib/utils'
import { Checkpoint } from '@/types/trip'
import { format } from 'date-fns'
import { ArrowLeft, ChevronDown, Clock, Ellipsis, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'
interface TripDetailProps {
  open: boolean
  onClose: () => void
  checkpoints?: Checkpoint[]
}

const TripDetail = ({ open, onClose, checkpoints = [] }: TripDetailProps) => {
  const t = useTranslations('common')
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleTrip = isExpanded ? checkpoints : checkpoints.slice(0, 3)

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
        <ScrollArea className="h-full mt-4">
          <Timeline>
            {visibleTrip.map((item, index) => {
              const isLast = index === visibleTrip.length - 1
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

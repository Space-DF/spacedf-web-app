import { RightSideBarLayout } from '@/components/ui'
import { useTranslations } from 'next-intl'
import DeviceSelected from './components/device-selected'
import { ArrowLeft } from 'lucide-react'
import ListEvent from './components/list-event'
import ListGeofences from './components/list-geofences'
import TripHistory from './components/trip-history'
import { Slide } from '@/components/ui/slide'

interface DeviceDetailProps {
  onClose: () => void
  open: boolean
}

const DeviceDetail = ({ onClose, open }: DeviceDetailProps) => {
  const t = useTranslations('common')
  return (
    <Slide
      className="w-full bg-brand-fill-surface dark:bg-brand-fill-outermost p-0 overflow-y-auto"
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
            <div>{t('device_detail')}</div>
          </div>
        }
      >
        <div className="h-full mt-4">
          <div className="flex flex-col gap-8 pb-20">
            <DeviceSelected />
            <ListEvent />
            <ListGeofences />
            <TripHistory />
          </div>
        </div>
      </RightSideBarLayout>
    </Slide>
  )
}

export default DeviceDetail

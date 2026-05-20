import { Button } from '@/components/ui/button'
import { RightSideBarLayout } from '@/components/ui'
import { useTranslations } from 'next-intl'
import DeviceSelected from './components/device-selected'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import TripHistory from './components/trip-history'
import { Slide } from '@/components/ui/slide'
import { Skeleton } from '@/components/ui/skeleton'
import ListAlert from './components/list-alert'
import { useDeviceStore } from '@/stores/device-store'
import ListEvent from './components/list-event'
import ListEntity from './components/list-entity'
import { transformDeviceData } from '@/utils/map'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { useParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGetDeviceByDeviceId } from './hooks/useGetDeviceByDeviceId'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import { useOrganizationValidationStore } from '@/stores/organization-validation-store'

const mapInstance = MapInstance.getInstance()

interface DeviceDetailProps {
  onClose: () => void
  open: boolean
}

const DeviceDetail = ({ onClose, open }: DeviceDetailProps) => {
  const t = useTranslations('common')
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const { deviceSelected, deviceDataSelected } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
      deviceDataSelected: state.devices[state.deviceSelected],
    }))
  )
  const isSmartBuildingTemplate = useOrganizationValidationStore(
    (state) => state.isSmartBuilding
  )
  const isMapReady = useFleetTrackingMapStore((state) => state.isMapReady)

  const missingFromList =
    open && !!deviceSelected && !!spaceSlug && deviceDataSelected === undefined

  const {
    data: deviceFromApi,
    error: fetchError,
    isLoading,
    mutate: refetchDevice,
  } = useGetDeviceByDeviceId(deviceSelected, missingFromList)

  const mappedFromApi = useMemo(() => {
    if (!deviceFromApi) return undefined
    return transformDeviceData([deviceFromApi])[0]
  }, [deviceFromApi])

  useEffect(() => {
    if (!open || !mappedFromApi || !isMapReady) return
    mapInstance.onZoomToDevice(mappedFromApi)
  }, [open, mappedFromApi, isMapReady])

  const hasLoadError =
    missingFromList &&
    !isLoading &&
    Boolean(fetchError || !deviceFromApi || (deviceFromApi && !mappedFromApi))

  const selectedDevice = !open ? undefined : deviceDataSelected || mappedFromApi

  const isWlb = selectedDevice?.type === 'wlb'

  const entities = selectedDevice?.entities ?? []

  const detailHeader = (
    <div className="flex size-full items-center gap-2">
      <ArrowLeft size={20} className="cursor-pointer" onClick={onClose} />
      <div>{t('device_detail')}</div>
    </div>
  )

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
      {open &&
        !!deviceSelected &&
        !selectedDevice &&
        !hasLoadError &&
        isLoading && (
          <RightSideBarLayout
            onClose={onClose}
            className="h-full relative"
            title={detailHeader}
          >
            <div className="h-full mt-4">
              <div className="flex flex-col gap-8 pb-20">
                <div className="flex flex-col gap-2 rounded-xl bg-brand-component-fill-gray-soft p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-7 shrink-0 rounded-md" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="size-8 shrink-0 rounded-md" />
                      <Skeleton className="size-8 shrink-0 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-1">
                    <Skeleton className="h-3 w-full max-w-60" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-28" />
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="size-9 shrink-0 rounded-full" />
                      <div className="flex flex-1 flex-col gap-2 pt-0.5">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </RightSideBarLayout>
        )}
      {open && !!deviceSelected && hasLoadError && (
        <RightSideBarLayout
          onClose={onClose}
          className="h-full relative"
          title={detailHeader}
        >
          <div className="flex min-h-[min(420px,70vh)] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div
              className="flex size-14 items-center justify-center rounded-full bg-brand-component-fill-gray-soft dark:bg-brand-stroke-outermost"
              aria-hidden
            >
              <AlertCircle
                className="size-7 text-brand-component-text-gray"
                strokeWidth={1.75}
              />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-brand-component-text-dark">
                {t('device_not_found')}
              </p>
              <p className="max-w-[min(320px,100%)] text-sm leading-relaxed text-brand-component-text-gray">
                {t('device_not_found_description')}
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              className="mt-2 min-w-24"
              onClick={() => refetchDevice()}
            >
              {t('try_again')}
            </Button>
          </div>
        </RightSideBarLayout>
      )}
      {selectedDevice && (
        <RightSideBarLayout
          onClose={onClose}
          className="h-full relative"
          title={detailHeader}
        >
          <div className="h-full mt-4">
            <div className="flex flex-col gap-8 pb-20">
              <DeviceSelected />
              {isSmartBuildingTemplate &&
                selectedDevice.position &&
                selectedDevice.building && <ListEntity entities={entities} />}
              <ListEvent deviceId={selectedDevice.id} />
              {!isSmartBuildingTemplate &&
                (isWlb ? <ListAlert /> : <TripHistory />)}
            </div>
          </div>
        </RightSideBarLayout>
      )}
    </Slide>
  )
}

export default DeviceDetail

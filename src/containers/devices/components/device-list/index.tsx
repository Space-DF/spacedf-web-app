import { useDebounce } from '@/hooks'
import { useGetDevices } from '@/hooks/useDevices'
import { Device, useDeviceStore } from '@/stores/device-store'
import { DeviceDataOriginal } from '@/types/device'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTripAddress } from '../device-detail/components/trip-history/hooks/useTripAddress'
import { useVirtualizer } from '@tanstack/react-virtual'
import { transformDeviceData } from '@/utils/map'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { AddDeviceDialog } from '../add-device-dialog'
import { Ellipsis, LoaderCircle, PlusIcon, Search } from 'lucide-react'
import { InputWithIcon } from '@/components/ui/input'
import { Nodata } from '@/components/ui'
import { cn } from '@/lib/utils'
import ImageWithBlur from '@/components/ui/image-blur'
import DeviceIcon from '/public/images/device-icon.webp'
import { Map } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddDeviceStore } from '@/stores/template/add-device'

const mapInstance = MapInstance.getInstance()

export const DevicesList = ({ onClose }: { onClose: () => void }) => {
  const t = useTranslations('addNewDevice')
  const [deviceName, setDeviceName] = useState('')
  const debouncedDeviceName = useDebounce(deviceName)
  const {
    data: devices = [],
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetDevices({ deviceName: debouncedDeviceName })

  const { locations, deviceHasLocation } = useMemo(() => {
    const locations = [] as [number, number][]
    const deviceHasLocation = [] as DeviceDataOriginal[]
    devices.forEach((device) => {
      if (
        device?.device_properties?.latest_checkpoint?.latitude &&
        device?.device_properties?.latest_checkpoint?.longitude
      ) {
        locations.push([
          device?.device_properties?.latest_checkpoint?.longitude,
          device?.device_properties?.latest_checkpoint?.latitude,
        ])
        deviceHasLocation.push(device)
      }
    })

    return { locations, deviceHasLocation }
  }, [devices])

  const { data: listLocationName = [], isLoading: isLoadingLocation } =
    useTripAddress(locations)

  const deviceIdsHasLocation = useMemo(() => {
    return deviceHasLocation.map((device) => device.id)
  }, [deviceHasLocation])

  const { deviceSelected, setDeviceSelected, setDevices } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
      setDevices: state.setDevices,
    }))
  )

  const { buildingId, setBuilding } = useAddDeviceStore(
    useShallow((state) => ({
      buildingId: state.building?.id,
      setBuilding: state.setBuilding,
    }))
  )

  const parentRef = useRef<HTMLDivElement>(null)
  const fetchingRef = useRef(false)

  const rowCount = Math.ceil(devices.length / 2)

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? rowCount + 1 : rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 106,
    overscan: 5,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse()

    if (!lastItem) return

    if (
      lastItem.index >= rowCount - 1 &&
      !isLoading &&
      hasNextPage &&
      !isFetchingNextPage &&
      !fetchingRef.current
    ) {
      fetchingRef.current = true
      fetchNextPage()
    }
  }, [
    virtualItems.length,
    rowCount,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  // Reset fetching ref when loading completes
  useEffect(() => {
    if (!isFetchingNextPage) {
      fetchingRef.current = false
    }
  }, [isFetchingNextPage])

  useEffect(() => {
    const newDevices: Device[] = transformDeviceData(devices)
    setDevices(newDevices)
  }, [devices])

  const handleSelectDevice = (device: DeviceDataOriginal) => {
    setDeviceSelected(device.device.id)
    const deviceBuildingId = device.building?.id
    if (buildingId && deviceBuildingId && deviceBuildingId !== buildingId) {
      setBuilding(device.building)
    }
    const deviceData = transformDeviceData([device])[0]
    if (deviceData) {
      mapInstance.onZoomToDevice(deviceData)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-foreground">{t('devices_list')}</div>
        <div className="flex space-x-1 items-center">
          <AddDeviceDialog />
          <div
            className="group h-max cursor-pointer rounded-sm p-1 hover:bg-brand-fill-surface hover:dark:bg-brand-stroke-outermost"
            onClick={onClose}
          >
            <PlusIcon
              width={24}
              height={24}
              className="rotate-45 duration-300 group-hover:-rotate-45 group-hover:scale-110 dark:text-brand-dark-text-gray"
            />
          </div>
        </div>
      </div>
      <InputWithIcon
        prefixCpn={<Search size={18} className="text-muted-foreground" />}
        placeholder={t('device')}
        wrapperClass="w-full"
        value={deviceName}
        onChange={(e) => setDeviceName(e.target.value)}
      />
      <div
        className="flex overflow-y-auto h-dvh scroll-smooth [&::-webkit-scrollbar-thumb]:border-r-4 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]"
        ref={parentRef}
      >
        <div className="flex-1 transition-all duration-300">
          {devices.length === 0 && !isLoading ? (
            <Nodata content="No devices found" />
          ) : (
            <div
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {virtualItems.map((virtualRow) => {
                const startIndex = virtualRow.index * 2
                const endIndex = Math.min(startIndex + 2, devices.length)
                const rowDevices = devices.slice(startIndex, endIndex)

                // Show loading indicator for the last row when loading more
                if (
                  virtualRow.index === rowCount &&
                  (isLoading || isFetchingNextPage)
                ) {
                  return (
                    <div
                      key={virtualRow.key}
                      className="absolute top-0 left-0 w-full flex items-center justify-center"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <LoaderCircle className="text-primary size-6 animate-spin" />
                    </div>
                  )
                }

                return (
                  <div
                    key={virtualRow.key}
                    className="absolute top-0 left-0 w-full grid grid-cols-2 gap-1"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {rowDevices.map((device) => {
                      const index = deviceIdsHasLocation.findIndex(
                        (id) => id === device.id
                      )
                      const isHasLocation = index !== -1
                      const locationName =
                        isHasLocation &&
                        listLocationName[index]?.features?.[0]?.place_name
                          ? listLocationName[index].features[0].place_name
                          : 'Unknown'

                      return (
                        <div
                          key={device.id}
                          className={cn(
                            'cursor-pointer h-fit rounded-card border border-transparent bg-brand-background-fill-surface p-2 text-brand-component-text-dark',
                            {
                              'border-brand-component-stroke-dark':
                                device?.device.id === deviceSelected,
                            }
                          )}
                          onClick={() => handleSelectDevice(device)}
                        >
                          <div className="space-y-2 mb-2">
                            <div className="flex items-start justify-between">
                              <div className="size-8">
                                <ImageWithBlur
                                  src={
                                    device.device.device_profile?.logo ||
                                    DeviceIcon
                                  }
                                  alt="DMZ 01 -1511-M01"
                                  width={70}
                                  height={70}
                                />
                              </div>
                              <Ellipsis size={16} className="text-foreground" />
                            </div>
                            <div className="text-xs font-medium">
                              <span className="leading-[18px] line-clamp-1 text-foreground">
                                {device.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium ">
                            <Map
                              size={16}
                              className="text-muted-foreground w-max"
                            />
                            <span
                              className="leading-[18px] line-clamp-1 flex-1 truncate text-muted-foreground"
                              title={
                                (isHasLocation && locationName) || undefined
                              }
                            >
                              {isLoadingLocation ? (
                                <Skeleton className="w-full h-4" />
                              ) : isHasLocation ? (
                                locationName
                              ) : (
                                'N/A'
                              )}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

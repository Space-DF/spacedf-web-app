'use client'

import { WATER_DEPTH_LEVEL_COLOR } from '@/constants'
import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { GlobalOverlayInstance } from '@/utils/fleet-tracking-map/layer-instance/global-overlay-instance'
import { WaterLevelInstance } from '@/utils/fleet-tracking-map/layer-instance/water-level-instance'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'
import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getWaterDepthLevelName } from '@/utils/water-depth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useDisplayWaterDevice } from './hooks/useDisplayWaterDevice'

const fleetTrackingMap = FleetTrackingMap.getInstance()
const waterLevelInstance = WaterLevelInstance.getInstance()
const globalOverlayInstance = GlobalOverlayInstance.getInstance()

type ClusterDropdownData = {
  deviceIds: string[]
  location: [number, number]
  count: number
  screenPosition: { x: number; y: number }
} | null

export const WaterLevelLayer = () => {
  const [clusterDropdownData, setClusterDropdownData] =
    useState<ClusterDropdownData>(null)
  const t = useTranslations('dashboard')
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null)
  const isAlreadyShowTripRoute = useFleetTrackingStore(
    (state) => state.isAlreadyShowTripRoute
  )
  const devices = useDeviceStore(
    useShallow((state) => {
      const waterLevelDevices = Object.fromEntries(
        Object.entries(state.devicesFleetTracking).filter(
          ([_, device]) =>
            device.deviceInformation?.device_profile?.key_feature ===
            DEVICE_FEATURE_SUPPORTED.WATER_DEPTH
        )
      )
      return waterLevelDevices
    })
  )
  const {
    visibleDeviceIds,
    handleSelectDevice,
    clusterDropdownOpen,
    setClusterDropdownOpen,
  } = useDisplayWaterDevice(devices)

  const { setDeviceSelected, deviceSelected } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
    }))
  )

  const { modelType, mapType } = useFleetTrackingStore(
    useShallow((state) => ({
      modelType: state.modelType,
      mapType: state.mapType,
    }))
  )

  const { isClusterVisible } = useFleetTrackingStore(
    useShallow((state) => ({
      isClusterVisible: state.isClusterVisible,
      modelType: state.modelType,
    }))
  )

  useEffect(() => {
    const handleZoomEnd = () => {
      if (isClusterVisible && !isAlreadyShowTripRoute) {
        setDeviceSelected('')
      }
    }

    fleetTrackingMap.on('zoomend', handleZoomEnd)
    return () => {
      fleetTrackingMap.off('zoomend', handleZoomEnd)
    }
  }, [isClusterVisible, isAlreadyShowTripRoute])

  useEffect(() => {
    if (isClusterVisible) {
      waterLevelInstance.syncDevices(devices)
      waterLevelInstance.buildLayers('hidden')
    } else {
      waterLevelInstance.syncDevices(devices)
      waterLevelInstance.buildLayers('visible')
    }

    fleetTrackingMap.on('reattach', (map: mapboxgl.Map) => {
      const globalOverlay = globalOverlayInstance.init(map)
      if (globalOverlay) {
        waterLevelInstance.init(map, globalOverlay)
      }

      waterLevelInstance.syncDevices(devices)
      waterLevelInstance.buildLayers('hidden')
    })

    return () => {
      fleetTrackingMap.off('reattach', () => {
        waterLevelInstance.syncDevices(devices)
        waterLevelInstance.buildLayers('hidden')
      })
    }
  }, [devices, isClusterVisible])

  useEffect(() => {
    const handleMapLoaded = (map: mapboxgl.Map) => {
      const globalOverlay = globalOverlayInstance.init(map)
      if (globalOverlay) {
        waterLevelInstance.init(map, globalOverlay)
      }
    }

    fleetTrackingMap.on('style.load', handleMapLoaded)

    return () => {
      fleetTrackingMap.off('style.load', handleMapLoaded)
    }
  }, [])

  useEffect(() => {
    waterLevelInstance.on('water-level-selected', (deviceId: string) => {
      setDeviceSelected(deviceId)
    })

    return () => {
      waterLevelInstance.off('water-level-selected', () => {
        setDeviceSelected('')
      })
    }
  }, [setDeviceSelected])

  useEffect(() => {
    const handleClusterClicked = (data: ClusterDropdownData) => {
      setClusterDropdownData(data)
      setClusterDropdownOpen(true)
    }

    waterLevelInstance.on('cluster-clicked', handleClusterClicked)

    return () => {
      waterLevelInstance.off('cluster-clicked', handleClusterClicked)
    }
  }, [])

  const clusterDevices = clusterDropdownData?.deviceIds
    .map((id) => devices[id])
    .filter(Boolean) as Device[] | undefined

  useEffect(() => {
    fleetTrackingMap.on('style.load', () => {
      waterLevelInstance.handleRain()
    })
    return () => {
      fleetTrackingMap.off('style.load', () => {
        waterLevelInstance.handleRain()
      })
    }
  }, [modelType, mapType])

  useEffect(() => {
    const map = fleetTrackingMap.getMap()
    waterLevelInstance.syncDevices(devices)

    waterLevelInstance.handleWaterLevelSelected(deviceSelected)

    const device = devices?.[deviceSelected]

    if (map && device) {
      map.flyTo({
        center: device.deviceProperties?.latest_checkpoint_arr as [
          number,
          number,
        ],
        zoom: 18,
        duration: 500,
        essential: true,
        pitch: 70,
      })
    }
  }, [deviceSelected, devices])

  return (
    <>
      <div
        className="absolute bottom-8 right-2 w-[200px] rounded-lg h-max bg-white/90 backdrop-blur-sm z-[1000] p-3 shadow-sm
      dark:bg-[#171A28CC] dark:text-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <WaterLevelLegendIcon />
          <span className="font-medium">Water Level</span>
        </div>

        <div className="px-1 space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded-full border-2 border-gray-200 dark:border-white/90"
              style={{ backgroundColor: WATER_DEPTH_LEVEL_COLOR.safe.primary }}
            />
            <span>0 &#8594; &lt;0.1m (Safe)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded-full border-2 border-gray-200 dark:border-white/90"
              style={{
                backgroundColor: WATER_DEPTH_LEVEL_COLOR.caution.primary,
              }}
            />
            <span>0.1 &#8594; &lt;0.3m (Caution)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded-full border-2 border-gray-200 dark:border-white/90"
              style={{
                backgroundColor: WATER_DEPTH_LEVEL_COLOR.warning.primary,
              }}
            />
            <span>0.3 &#8594; &le;0.6m (Warning)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded-full border-2 border-gray-200 dark:border-white/90"
              style={{
                backgroundColor: WATER_DEPTH_LEVEL_COLOR.critical.primary,
              }}
            />
            <span> &gt;0.6m (Danger)</span>
          </div>
        </div>
      </div>
      <DropdownMenu
        open={clusterDropdownOpen}
        onOpenChange={setClusterDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <button
            ref={dropdownTriggerRef}
            className="fixed opacity-0 pointer-events-none size-0"
            style={{
              left: clusterDropdownData?.screenPosition?.x ?? 0,
              top: clusterDropdownData?.screenPosition?.y ?? 0,
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={5}
          className="w-48 max-h-80 overflow-hidden bg-[#171A28] border-none rounded-lg p-3"
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="text-white font-medium">{t('device')}</span>
            <X
              size={20}
              className="text-[#667085]"
              onClick={() => setClusterDropdownOpen(false)}
            />
          </DropdownMenuLabel>
          <ScrollArea className="max-h-56">
            {clusterDevices?.map((device) => {
              const waterLevel = device.deviceProperties?.water_depth || 0
              const levelName = getWaterDepthLevelName(waterLevel)
              const levelColor = WATER_DEPTH_LEVEL_COLOR[levelName]?.primary

              return (
                <DropdownMenuItem
                  key={device.id}
                  onClick={() => handleSelectDevice(device.id)}
                  className={cn(
                    'flex items-center gap-3 py-2.5 cursor-pointer focus:bg-brand-component-fill-secondary hover:bg-brand-component-fill-secondary',
                    visibleDeviceIds.get(device.id) ||
                      device.id === deviceSelected
                      ? 'bg-brand-component-fill-secondary'
                      : ''
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={'/images/water-flood-device.png'}
                      alt="water level icon"
                      width={20}
                      height={20}
                    />
                    <p
                      className="font-medium text-sm truncate"
                      style={{ color: levelColor }}
                    >
                      {device.name}
                    </p>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

const WaterLevelLegendIcon = () => (
  <svg
    width="20"
    height="16"
    viewBox="0 0 20 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 0.415898C20 0.183711 19.7967 -0.00273436 19.5662 0.0254688C17.4899 0.279414 17.3457 2.34598 14.9987 2.34598C12.498 2.34598 12.5007 0 10 0C7.50105 0 7.4984 2.34598 4.99945 2.34598C2.6534 2.34598 2.50918 0.279531 0.433789 0.0255078C0.20332 -0.00269532 0 0.18375 0 0.415938V14.5238C0 15.1716 0.525156 15.6968 1.17301 15.6968H18.827C19.4748 15.6968 20 15.1716 20 14.5238L20 0.415898Z"
      fill="#A9D8FF"
    />
    <path
      d="M20 4.69238C17.4993 4.69238 17.4993 7.03836 14.9987 7.03836C12.498 7.03836 12.5007 4.69238 10 4.69238C7.50105 4.69238 7.4984 7.03836 4.99945 7.03836C2.49973 7.03836 2.49973 4.69238 0 4.69238V14.5241C0 15.172 0.525156 15.6971 1.17301 15.6971H18.827C19.4748 15.6971 20 15.172 20 14.5241L20 4.69238Z"
      fill="#7AC0F9"
    />
    <path
      d="M20 9.38391C17.4993 9.38391 17.4993 11.7299 14.9987 11.7299C12.498 11.7299 12.5007 9.38391 10 9.38391C7.50105 9.38391 7.4984 11.7299 4.99945 11.7299C2.49973 11.7299 2.49973 9.38391 0 9.38391V14.5237C0 15.1715 0.525156 15.6967 1.17301 15.6967H18.827C19.4748 15.6967 20 15.1716 20 14.5237L20 9.38391Z"
      fill="#4EA7D8"
    />
  </svg>
)

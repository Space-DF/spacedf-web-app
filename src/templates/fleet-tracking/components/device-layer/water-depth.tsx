'use client'

import { Device, useDeviceStore } from '@/stores/device-store'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import isEqual from 'fast-deep-equal'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import { useShallow } from 'zustand/react/shallow'
import MapInstance from '../../core/map-instance'
import { WaterDepthDeckInstance } from '../../core/water-depth/water-depth-deckgl-instance'
import { WaterDepthLegend } from '../water-depth-legend'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getWaterDepthLevelName } from '@/utils/water-depth'
import { WATER_DEPTH_LEVEL_COLOR } from '@/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useDisplayWaterDepthDevice } from './hooks/useDisplayWaterDepthDevice'

const shouldUpdate = (
  prevProps: WaterDepthLayerProps,
  nextProps: WaterDepthLayerProps
) => {
  return isEqual(prevProps.devices, nextProps.devices)
}

type WaterDepthLayerProps = {
  devices: Device[]
}

type HandleResourceFn = {
  type: 'hidden' | 'visible'
  devices: Device[]
}

type ClusterDropdownData = {
  deviceIds: string[]
  location: [number, number]
  count: number
  screenPosition: { x: number; y: number }
} | null

const mapInstance = MapInstance.getInstance()
const waterLevelDeckInstance = WaterDepthDeckInstance.getInstance()

const WaterDepthLayer = ({ devices }: WaterDepthLayerProps) => {
  const resourceReady = useRef(false)
  const [clusterDropdownData, setClusterDropdownData] =
    useState<ClusterDropdownData>(null)
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null)
  const t = useTranslations('dashboard')

  const { isMapReady, isClusterVisible } = useFleetTrackingMapStore(
    useShallow((state) => ({
      isMapReady: state.isMapReady,
      isClusterVisible: state.isClusterVisible,
      viewMode: state.viewMode,
    }))
  )

  const { deviceSelected, setDeviceSelected } = useDeviceStore(
    useShallow((state) => ({
      setDeviceSelected: state.setDeviceSelected,
      deviceSelected: state.deviceSelected,
    }))
  )

  const {
    visibleDeviceIds,
    handleSelectDevice,
    clusterDropdownOpen,
    setClusterDropdownOpen,
  } = useDisplayWaterDepthDevice(devices)

  const handleWaterDepthSelected = useCallback(
    ({ deviceId }: { deviceId: string; deviceData: Device }) => {
      setDeviceSelected(deviceId)
    },
    []
  )
  useEffect(() => {
    if (!isMapReady) return

    const map = mapInstance.getMap()
    if (!map) return

    if (!resourceReady.current) {
      waterLevelDeckInstance.init(map)
      resourceReady.current = true
    }

    handleResource({
      type: isClusterVisible ? 'hidden' : 'visible',
      devices,
    })
  }, [devices, isMapReady, isClusterVisible])

  useEffect(() => {
    if (!isMapReady) return

    waterLevelDeckInstance.on(
      'water-depth-device-selected',
      handleWaterDepthSelected
    )

    return () => {
      waterLevelDeckInstance.off(
        'water-depth-device-selected',
        handleWaterDepthSelected
      )
    }
  }, [isMapReady, handleWaterDepthSelected])

  useEffect(() => {
    const handleClusterClicked = (data: ClusterDropdownData) => {
      setClusterDropdownData(data)
      setClusterDropdownOpen(true)
    }

    waterLevelDeckInstance.on('cluster-clicked', handleClusterClicked)

    return () => {
      waterLevelDeckInstance.off('cluster-clicked', handleClusterClicked)
    }
  }, [setClusterDropdownOpen])

  useEffect(() => {
    const map = mapInstance.getMap()
    if (!map) return

    waterLevelDeckInstance.onDeviceSelectChanged(deviceSelected)

    const device = devices.find((device) => device.id === deviceSelected)

    if (device) {
      mapInstance.onZoomToDevice(device)
    }
  }, [deviceSelected, devices])

  const handleResource = useCallback(({ devices, type }: HandleResourceFn) => {
    waterLevelDeckInstance.syncDevice({ devices, type })
  }, [])

  const clusterDevices = useMemo(
    () =>
      clusterDropdownData?.deviceIds
        .map((id) => devices.find((d) => d.id === id))
        .filter(Boolean) as Device[] | undefined,
    [clusterDropdownData, devices]
  )

  return (
    <>
      <WaterDepthLegend />
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
              const isSelected =
                visibleDeviceIds.get(device.id) || device.id === deviceSelected
              return (
                <DropdownMenuItem
                  key={device.id}
                  onClick={() => handleSelectDevice(device.id)}
                  className={cn(
                    'flex items-center gap-3 py-2.5 cursor-pointer focus:bg-brand-component-fill-secondary hover:bg-brand-component-fill-secondary',
                    isSelected ? 'bg-brand-component-fill-secondary' : ''
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

export default memo(WaterDepthLayer, (prevProps, nextProps) => {
  return shouldUpdate(prevProps, nextProps)
})

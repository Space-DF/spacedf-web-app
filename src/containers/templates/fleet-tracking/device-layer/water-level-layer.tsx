'use client'

import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { GlobalOverlayInstance } from '@/utils/fleet-tracking-map/layer-instance/global-overlay-instance'
import { WaterLevelInstance } from '@/utils/fleet-tracking-map/layer-instance/water-level-instance'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

const fleetTrackingMap = FleetTrackingMap.getInstance()
const waterLevelInstance = WaterLevelInstance.getInstance()
const globalOverlayInstance = GlobalOverlayInstance.getInstance()

export const WaterLevelLayer = () => {
  const devices = useDeviceStore(
    useShallow((state) => {
      //handle water level devices
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

  const { setDeviceSelected, deviceSelected } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
      setDeviceProperties: state.setDeviceProperties,
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
      if (isClusterVisible) {
        setDeviceSelected('')
      }
    }

    fleetTrackingMap.on('zoomend', handleZoomEnd)
    return () => {
      fleetTrackingMap.off('zoomend', handleZoomEnd)
    }
  }, [isClusterVisible])

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
        className="absolute bottom-8 right-2 w-[155px] rounded-lg h-max bg-white/90 backdrop-blur-sm z-[1000] p-3 shadow-sm
      dark:bg-[#171A28CC] dark:text-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <WaterLevelLegendIcon />
          <span className="font-medium">Water Level</span>
        </div>

        <div className="px-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-5 bg-[#01D195] rounded-full border-2 border-gray-200 dark:border-white/90" />
            <span>0 &#8594; &lt;0.1m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-5 bg-[#e0cb2f] rounded-full border-2 border-gray-200 dark:border-white/90" />
            <span>0.1 &#8594; &lt;0.3m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-5 bg-[#e78930cc] rounded-full border-2 border-gray-200 dark:border-white/90" />
            <span>0.3 &#8594; &le;0.6m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-5 bg-[#FB8588] rounded-full border-2 border-gray-200 dark:border-white/90" />
            <span> &gt;0.6m (danger)</span>
          </div>
        </div>
      </div>
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

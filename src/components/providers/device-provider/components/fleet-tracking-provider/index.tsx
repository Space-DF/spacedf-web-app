import { useBBoxDebounce } from '@/hooks/useBBoxDebounce'
import { useGetDevices } from '@/hooks/useDevices'
import { useGlobalStore } from '@/stores'
import { Device, useDeviceStore } from '@/stores/device-store'
import { transformDeviceData } from '@/utils/map'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useLoadModel } from '../../hooks/useLoadModel'

export const FleetTrackingProvider = ({ children }: PropsWithChildren) => {
  const isFirstLoadRef = useRef(true)
  const setGlobalLoading = useGlobalStore((state) => state.setGlobalLoading)
  const bBoxDebounce = useBBoxDebounce()
  const { setInitializedSuccess, clearDeviceModels, setDevicesFleetTracking } =
    useDeviceStore(
      useShallow((state) => ({
        setInitializedSuccess: state.setInitializedSuccess,
        clearDeviceModels: state.clearDeviceModels,
        setDevicesFleetTracking: state.setDevicesFleetTracking,
      }))
    )
  const { data: deviceSpaces, isLoading: isLoadingDevices } = useGetDevices({
    bbox: bBoxDebounce,
  })

  useEffect(() => {
    if (isLoadingDevices) return
    const devices: Device[] = transformDeviceData(deviceSpaces || [])
    setDevicesFleetTracking(devices)
  }, [deviceSpaces, isLoadingDevices])

  useEffect(() => {
    if (isFirstLoadRef.current) {
      if (isLoadingDevices) {
        setGlobalLoading(true)
      } else {
        setGlobalLoading(false)
        isFirstLoadRef.current = false
      }
    }

    setInitializedSuccess(!isLoadingDevices)
  }, [isLoadingDevices])

  useLoadModel()

  useEffect(() => {
    return () => {
      clearDeviceModels()
    }
  }, [clearDeviceModels])

  return <>{children}</>
}

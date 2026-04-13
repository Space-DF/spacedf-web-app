'use client'
import { useBBoxDebounce } from '@/hooks/useBBoxDebounce'
import { useGetDevices } from '@/hooks/useDevices'
import { useGlobalStore } from '@/stores'
import { Device, useDeviceStore } from '@/stores/device-store'
import { transformDeviceData } from '@/utils/map'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMqtt } from './hooks/useMqtt'
import { useLoadModel } from './hooks/useLoadModel'

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const { setInitializedSuccess, clearDeviceModels, setDevicesFleetTracking } =
    useDeviceStore(
      useShallow((state) => ({
        setInitializedSuccess: state.setInitializedSuccess,
        clearDeviceModels: state.clearDeviceModels,
        setDevicesFleetTracking: state.setDevicesFleetTracking,
      }))
    )
  const bBoxDebounce = useBBoxDebounce()

  const { data: deviceSpaces, isLoading: isLoadingDevices } = useGetDevices({
    bbox: bBoxDebounce,
  })
  const isFirstLoadRef = useRef(true)
  const setGlobalLoading = useGlobalStore((state) => state.setGlobalLoading)

  useMqtt()
  useLoadModel()

  const getDevices = async () => {
    const devices: Device[] = transformDeviceData(deviceSpaces || [])
    setDevicesFleetTracking(devices)
  }

  useEffect(() => {
    if (isLoadingDevices) return
    getDevices()
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

  useEffect(() => {
    return () => {
      clearDeviceModels()
    }
  }, [clearDeviceModels])

  return <>{children}</>
}

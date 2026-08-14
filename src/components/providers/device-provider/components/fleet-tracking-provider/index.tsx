import { useBBoxDebounce } from '@/hooks/useBBoxDebounce'
import { useGetDevices } from '@/hooks/useDevices'
import { useGlobalStore } from '@/stores'
import { Device, useDeviceStore } from '@/stores/device-store'
import { transformDeviceData } from '@/utils/map'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useLoadModel } from '../../hooks/useLoadModel'
import { useParams } from 'next/navigation'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useGetSpaces } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/spaces/hooks'

const REDIRECT_FALLBACK_TIMEOUT = 5000

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
  const isAuthenticated = useAuthenticated()
  const { data: spaces, isLoading: isLoadingSpaces } = useGetSpaces()
  const spaceList = spaces?.data?.results || []

  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  useEffect(() => {
    if (isLoadingDevices) return
    const devices: Device[] = transformDeviceData(deviceSpaces || [])
    setDevicesFleetTracking(devices)
  }, [deviceSpaces, isLoadingDevices])

  const isLoadingFirstPaint = spaceSlug
    ? isLoadingDevices
    : isLoadingSpaces || spaceList.length > 0

  useEffect(() => {
    if (!isAuthenticated) {
      setInitializedSuccess(true)
      setGlobalLoading(false)
      return
    }
    if (isFirstLoadRef.current) {
      setGlobalLoading(isLoadingFirstPaint)
      if (!isLoadingFirstPaint) {
        isFirstLoadRef.current = false
      }
    }

    setInitializedSuccess(!isLoadingDevices)
  }, [isLoadingFirstPaint, isAuthenticated, isLoadingDevices])

  const isWaitingForRedirect =
    isAuthenticated &&
    isFirstLoadRef.current &&
    !spaceSlug &&
    !isLoadingSpaces &&
    spaceList.length > 0

  useEffect(() => {
    if (!isWaitingForRedirect) return
    const timeoutId = setTimeout(() => {
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false
        setGlobalLoading(false)
      }
    }, REDIRECT_FALLBACK_TIMEOUT)
    return () => clearTimeout(timeoutId)
  }, [isWaitingForRedirect, setGlobalLoading])

  useLoadModel()

  useEffect(() => {
    return () => {
      clearDeviceModels()
    }
  }, [clearDeviceModels])

  return <>{children}</>
}

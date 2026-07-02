import { DeviceDataOriginal } from '@/types/device'
import { useDeviceStore } from '@/stores/device-store'
import { useLayout } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { NavigationEnums } from '@/constants'
import { useMoveDeviceStore } from '@/stores/template/move-device'
import { cn } from '@/lib/utils'
import { memo, useCallback } from 'react'
import EntityBadge from './badge'
import { Html } from '@react-three/drei'

const DeviceMarker = ({ device }: { device: DeviceDataOriginal }) => {
  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)
  const { toggleDynamicLayout, dynamicLayouts, setCookieDirty } = useLayout(
    useShallow((state) => ({
      toggleDynamicLayout: state.toggleDynamicLayout,
      dynamicLayouts: state.dynamicLayouts,
      setCookieDirty: state.setCookieDirty,
    }))
  )

  const {
    setDeviceId: setMoveDevice,
    deviceId: movingDeviceId,
    isDragging,
    setIsDragging,
    movedPositions,
    isEditMode,
  } = useMoveDeviceStore(
    useShallow((s) => ({
      setDeviceId: s.setDeviceId,
      deviceId: s.deviceId,
      isDragging: s.isDragging,
      setIsDragging: s.setIsDragging,
      movedPositions: s.movedPositions,
      isEditMode: s.isEditMode,
    }))
  )

  const isMovingThis = movingDeviceId === device.id
  const displayPos =
    isEditMode && movedPositions[device.id]
      ? movedPositions[device.id]
      : device.position
  const isCurrentlyDragging = isMovingThis && isDragging

  const handleSelectEntity = useCallback(() => {
    if (isEditMode || isMovingThis) return
    setDeviceSelected(device.device.id)
    if (!dynamicLayouts.includes(NavigationEnums.DEVICES)) {
      toggleDynamicLayout(NavigationEnums.DEVICES)
      setCookieDirty(true)
    }
  }, [
    device.device.id,
    dynamicLayouts,
    toggleDynamicLayout,
    setDeviceSelected,
    setCookieDirty,
    isMovingThis,
    isEditMode,
  ])

  if (!displayPos) return <></>
  return (
    <>
      {isCurrentlyDragging && device.position && (
        <Html
          position={[device.position.x, device.position.y, device.position.z]}
          center
          distanceFactor={10}
          zIndexRange={[0, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="opacity-40 grayscale pointer-events-none">
            <EntityBadge
              entities={device.entities ?? []}
              device_properties={device.device_properties}
            />
          </div>
        </Html>
      )}
      <Html
        position={[displayPos.x, displayPos.y, displayPos.z]}
        center
        distanceFactor={10}
        zIndexRange={[0, 0]}
      >
        <div
          className={cn(
            `flex flex-col items-center relative z-10 transition-all duration-200 select-none`,
            isCurrentlyDragging && 'cursor-grabbing scale-110 drop-shadow-2xl',
            !isCurrentlyDragging &&
              (isMovingThis || isEditMode) &&
              'cursor-grab drop-shadow-xl',
            !isEditMode &&
              !isMovingThis &&
              !isCurrentlyDragging &&
              'cursor-pointer'
          )}
          onPointerDown={(e) => {
            if (isEditMode || isMovingThis) {
              e.stopPropagation()
              setMoveDevice(device.id)
              setIsDragging(true)
            }
          }}
        >
          <div className="relative">
            <EntityBadge
              entities={device.entities ?? []}
              device_properties={device.device_properties}
              onSelectDevice={handleSelectEntity}
              isDraggingThis={isCurrentlyDragging}
            />
          </div>
        </div>
      </Html>
    </>
  )
}

export default memo(DeviceMarker)

import { DeviceDataOriginal } from '@/types/device'
import { useDeviceStore } from '@/stores/device-store'
import { useLayout } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { NavigationEnums } from '@/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMoveDeviceStore } from '@/stores/template/move-device'
import { cn } from '@/lib/utils'
import { memo, MouseEvent, useCallback, useEffect, useState } from 'react'
import EntityBadge from './badge'
import { Html } from '@react-three/drei'
import { useSaveMovedDevice } from '../hooks/useSaveMovedDevice'
import { Check, Move, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

const DeviceMarker = ({ device }: { device: DeviceDataOriginal }) => {
  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)
  const { toggleDynamicLayout, dynamicLayouts, setCookieDirty } = useLayout(
    useShallow((state) => ({
      toggleDynamicLayout: state.toggleDynamicLayout,
      dynamicLayouts: state.dynamicLayouts,
      setCookieDirty: state.setCookieDirty,
    }))
  )

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const t = useTranslations('smartBuilding')
  const {
    setDeviceId: setMoveDevice,
    setPosition: setMovePosition,
    deviceId: movingDeviceId,
    position: movingPos,
    isDragging,
    setIsDragging,
    reset,
  } = useMoveDeviceStore(
    useShallow((s) => ({
      setDeviceId: s.setDeviceId,
      setPosition: s.setPosition,
      deviceId: s.deviceId,
      position: s.position,
      isDragging: s.isDragging,
      setIsDragging: s.setIsDragging,
      reset: s.reset,
    }))
  )

  const isMovingThis = movingDeviceId === device.id
  const displayPos = isMovingThis && movingPos ? movingPos : device.position
  const isCurrentlyDragging = isMovingThis && isDragging

  const { save: saveMovedDevice, isSaving } = useSaveMovedDevice()

  useEffect(() => {
    if (!isMovingThis || isDragging || isConfirmOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        reset()
      } else if (e.key === 'Enter') {
        setIsConfirmOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMovingThis, isDragging, reset, isConfirmOpen])

  const handleSelectEntity = useCallback(() => {
    if (isMovingThis) return
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
  ])

  const handleOpenConfirmDialog = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsConfirmOpen(true)
  }

  const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    reset()
  }

  const handleSavePosition = async () => {
    await saveMovedDevice()
    setIsConfirmOpen(false)
  }

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
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className="absolute inset-0 z-0 pointer-events-none" />
          </DropdownMenuTrigger>
          <div
            className={cn(
              `flex flex-col items-center relative z-10 transition-all duration-200 select-none`,
              isCurrentlyDragging &&
                'cursor-grabbing opacity-60 scale-110 drop-shadow-2xl',
              isMovingThis && 'cursor-grab drop-shadow-xl',
              !isMovingThis && !isCurrentlyDragging && 'cursor-pointer'
            )}
            onPointerDown={(e) => {
              if (isMovingThis) {
                e.stopPropagation()
                setIsDragging(true)
              }
            }}
            onContextMenu={(e) => {
              if (isMovingThis) return
              e.preventDefault()
              e.stopPropagation()
              setDropdownOpen(true)
            }}
          >
            {isMovingThis && !isDragging && (
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background drop-shadow-lg rounded-xl p-1 z-30 pointer-events-auto"
                onPointerDown={(e) => {
                  e.stopPropagation()
                }}
              >
                <Button
                  onClick={handleCancel}
                  title="Cancel (Esc)"
                  size="icon"
                  variant="outline"
                >
                  <X size={14} />
                </Button>
                <Button
                  onClick={handleOpenConfirmDialog}
                  title="Save Position (Enter)"
                  size="icon"
                >
                  <Check size={14} />
                </Button>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-background" />
              </div>
            )}
            <div className="relative">
              <EntityBadge
                entities={device.entities ?? []}
                device_properties={device.device_properties}
                onSelectDevice={handleSelectEntity}
              />
            </div>
          </div>
          <DropdownMenuContent align="center" side="top">
            <DropdownMenuItem
              onSelect={() => {
                setMoveDevice(device.id)
                setMovePosition(device.position)
              }}
              className="group flex items-center gap-2 text-sm font-medium text-brand-component-text-gray group-hover:text-brand-component-text-dark"
            >
              <Move
                size={16}
                className="text-brand-component-text-gray group-hover:text-brand-component-text-dark"
                aria-hidden
              />
              Move Entity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmDialog
          open={isConfirmOpen}
          title={t('confirm_move_device_title')}
          description={t('confirm_move_device_description')}
          cancelLabel={t('cancel')}
          confirmLabel={t('save')}
          isConfirming={isSaving}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleSavePosition}
        />
      </Html>
    </>
  )
}

export default memo(DeviceMarker)

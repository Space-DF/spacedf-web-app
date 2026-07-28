'use client'

import { Nodata } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputWithIcon } from '@/components/ui/input'
import ImageWithBlur from '@/components/ui/image-blur'
import { useDebounce } from '@/hooks'
import { useGetDevices } from '@/hooks/useDevices'
import { cn } from '@/lib/utils'
import { DeviceDataOriginal } from '@/types/device'
import { Ellipsis, LoaderCircle, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import DeviceIcon from '/public/images/device-icon.webp'
import { useAssignDeviceModel } from './hooks/useAssignDeviceModel'
import { useAddDeviceStore } from '@/stores/template/add-device'
import { useShallow } from 'zustand/react/shallow'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Lock } from '@/components/icons'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type DeviceCardProps = {
  device: DeviceDataOriginal
  isSelected: boolean
  isDisabled: boolean
  onSelect: () => void
}

function DeviceCard({
  device,
  isSelected,
  isDisabled,
  onSelect,
}: DeviceCardProps) {
  const tSmart = useTranslations('smartBuilding')
  const tAddDevice = useTranslations('addNewDevice')
  const [isLockHovered, setIsLockHovered] = useState(false)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-disabled={isDisabled}
          onClick={() => !isDisabled && onSelect()}
          onKeyDown={(e) => {
            if (isDisabled || (e.key !== 'Enter' && e.key !== ' ')) return
            e.preventDefault()
            onSelect()
          }}
          className={cn(
            'flex flex-col rounded-md border bg-card p-2 text-left text-brand-component-text-dark transition-colors',
            isDisabled ? 'cursor-default' : 'cursor-pointer',
            isSelected ? 'border-border' : 'border-transparent',
            !isDisabled && !isSelected && 'hover:border-border/80',
            isDisabled && 'opacity-50'
          )}
        >
          <div className="mb-2 flex items-start justify-between">
            <div className="size-10 shrink-0">
              <ImageWithBlur
                src={device.device.device_profile?.logo || DeviceIcon}
                alt={device.name}
                width={70}
                height={70}
              />
            </div>
            <div className="flex space-x-1 items-center">
              {device.device.is_deactivated && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="size-5 rounded-md justify-center flex items-center border border-brand-component-stroke-warning-soft bg-brand-component-fill-warning-soft"
                      onClick={(e) => e.stopPropagation()}
                      onPointerEnter={() => setIsLockHovered(true)}
                      onPointerLeave={() => setIsLockHovered(false)}
                    >
                      <Lock className="text-brand-icon-warning-dark" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px] text-xs">
                    {tAddDevice('device_deactivated_tooltip')}
                  </TooltipContent>
                </Tooltip>
              )}
              <Ellipsis size={16} className="text-muted-foreground" />
            </div>
          </div>
          <div className="mb-2 text-xs font-medium">
            <span className="line-clamp-2">{device.name}</span>
          </div>
        </div>
      </TooltipTrigger>
      {isDisabled && !isLockHovered && (
        <TooltipContent side="top" className="max-w-[260px] text-xs">
          {tSmart('select_device_published_disabled')}
        </TooltipContent>
      )}
    </Tooltip>
  )
}

export function DialogSelectDeviceFromList({ open, onOpenChange }: Props) {
  const tSmart = useTranslations('smartBuilding')
  const tAddDevice = useTranslations('addNewDevice')
  const [deviceName, setDeviceName] = useState('')
  const debouncedDeviceName = useDebounce(deviceName)
  const [selected, setSelected] = useState<DeviceDataOriginal | null>(null)
  const { mutateAsync: assignDevice, isPending: isAssigningDevice } =
    useAssignDeviceModel()
  const {
    data: devices = [],
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetDevices({ deviceName: debouncedDeviceName })

  const sentinelRef = useRef<HTMLDivElement>(null)
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!open) {
      setDeviceName('')
      setSelected(null)
    }
  }, [open])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry.isIntersecting &&
          !isLoading &&
          hasNextPage &&
          !isFetchingNextPage &&
          !fetchingRef.current
        ) {
          fetchingRef.current = true
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (!isFetchingNextPage) fetchingRef.current = false
  }, [isFetchingNextPage])

  const { buildingId, position } = useAddDeviceStore(
    useShallow((s) => ({
      buildingId: s.building?.id,
      position: s.position,
    }))
  )

  const handleConfirm = async () => {
    if (!selected || !buildingId || !position) return
    await assignDevice({
      deviceId: selected.id,
      buildingId,
      position,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] max-w-4xl flex-col gap-0 p-0 sm:max-w-2xl"
        showCloseIcon
      >
        <DialogHeader className="border-0 p-4">
          <DialogTitle className="text-brand-component-text-dark text-[16px] font-semibold leading-none tracking-tight">
            {tSmart('select_device_from_list_title')}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {tSmart('select_device_from_list_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-4 pb-2 pt-2">
          <InputWithIcon
            prefixCpn={
              <Search size={18} className="text-brand-component-text-gray" />
            }
            placeholder={tAddDevice('device')}
            wrapperClass="w-full"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />

          <div className="max-h-[min(52vh,520px)] overflow-y-auto scroll-smooth [&::-webkit-scrollbar-thumb]:border-r-4 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]">
            {devices.length === 0 && !isLoading ? (
              <Nodata content={tSmart('select_device_no_results')} />
            ) : (
              <div className="grid grid-cols-4 gap-2 pb-2">
                {devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    isSelected={selected?.id === device.id}
                    isDisabled={device.device.is_published}
                    onSelect={() => setSelected(device)}
                  />
                ))}

                {/* Sentinel for infinite scroll */}
                {hasNextPage && (
                  <div ref={sentinelRef} className="col-span-4" />
                )}

                {/* Loading indicator */}
                {(isLoading || isFetchingNextPage) && (
                  <div className="col-span-4 flex items-center justify-center py-4">
                    <LoaderCircle className="size-6 animate-spin text-brand-bright-lavender" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 px-4 py-3 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {tSmart('cancel')}
          </Button>
          <Button
            type="button"
            disabled={!selected || isAssigningDevice}
            onClick={handleConfirm}
            loading={isAssigningDevice}
          >
            {tSmart('select_device_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

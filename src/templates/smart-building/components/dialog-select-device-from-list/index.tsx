'use client'

import { Nodata } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputWithIcon } from '@/components/ui/input'
import ImageWithBlur from '@/components/ui/image-blur'
import { useDebounce } from '@/hooks'
import { useGetDevices } from '@/hooks/useDevices'
import { cn } from '@/lib/utils'
import { useDeviceStore } from '@/stores/device-store'
import { DeviceDataOriginal } from '@/types/device'
import { Ellipsis, LoaderCircle, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import DeviceIcon from '/public/images/device-icon.webp'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DialogSelectDeviceFromList({ open, onOpenChange }: Props) {
  const tSmart = useTranslations('smartBuilding')
  const tAddDevice = useTranslations('addNewDevice')
  const [deviceName, setDeviceName] = useState('')
  const debouncedDeviceName = useDebounce(deviceName)
  const [selected, setSelected] = useState<DeviceDataOriginal | null>(null)

  const {
    data: devices = [],
    isReachingEnd,
    isLoading,
    setSize,
  } = useGetDevices({ deviceName: debouncedDeviceName })

  const setDeviceSelected = useDeviceStore((s) => s.setDeviceSelected)

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
          !isReachingEnd &&
          !fetchingRef.current
        ) {
          fetchingRef.current = true
          setSize((prev) => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isLoading, isReachingEnd, setSize])

  useEffect(() => {
    if (!isLoading) fetchingRef.current = false
  }, [isLoading])

  const handleConfirm = () => {
    if (!selected) return
    setDeviceSelected(selected.device.id)
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
                {devices.map((device) => {
                  const isCardSelected = selected?.id === device.id

                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => setSelected(device)}
                      className={cn(
                        'flex cursor-pointer flex-col rounded-md border bg-brand-component-fill-gray-soft p-2 text-left text-brand-component-text-dark transition-colors',
                        isCardSelected
                          ? 'border-brand-component-stroke-dark ring-1 ring-brand-bright-lavender'
                          : 'border-transparent hover:border-brand-stroke-dark-soft'
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="size-8 shrink-0">
                          <ImageWithBlur src={DeviceIcon} alt={device.name} />
                        </div>
                        <Ellipsis
                          size={16}
                          className="shrink-0 text-brand-component-text-gray"
                        />
                      </div>
                      <div className="mb-2 text-xs font-medium">
                        <span className="line-clamp-2">{device.name}</span>
                      </div>
                    </button>
                  )
                })}

                {/* Sentinel for infinite scroll */}
                {!isReachingEnd && (
                  <div ref={sentinelRef} className="col-span-4" />
                )}

                {/* Loading indicator */}
                {isLoading && (
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
          <Button type="button" disabled={!selected} onClick={handleConfirm}>
            {tSmart('select_device_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

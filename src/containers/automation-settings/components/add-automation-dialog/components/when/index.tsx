'use client'

import { useTranslations } from 'next-intl'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AddAutomationFormValues } from '../../schema'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  UIEvent,
  WheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useGetDevices } from '@/hooks/useDevices'
import { useDebounce } from '@/hooks'
import { Button } from '@/components/ui/button'
import { InputWithIcon } from '@/components/ui/input'
import { ChevronDown, Check, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhenProps {
  isEditable: boolean
}

export const When = ({ isEditable }: WhenProps) => {
  const t = useTranslations('automation')
  const { control } = useFormContext<AddAutomationFormValues>()
  const deviceId = useWatch({ control, name: 'device_id' })

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const {
    data: devices,
    isLoading,
    isValidating,
    isReachingEnd,
    setSize,
  } = useGetDevices({ deviceName: debouncedSearch })

  const deviceOptions = useMemo(
    () =>
      devices?.map((device) => ({
        value: device.device.id,
        label: device.name,
      })) ?? [],
    [devices]
  )

  const selectedDeviceLabel = useMemo(
    () => deviceOptions.find((d) => d.value === deviceId)?.label,
    [deviceOptions, deviceId]
  )

  useEffect(() => {
    setSize(1)
  }, [debouncedSearch])

  useEffect(() => {
    if (!isOpen) setSearch('')
  }, [isOpen])

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (isValidating || isReachingEnd) return
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
      if (scrollHeight - (scrollTop + clientHeight) <= 40) {
        setSize((prev) => prev + 1)
      }
    },
    [isReachingEnd, isValidating, setSize]
  )

  const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-lg font-semibold text-brand-component-text-dark">
          {t('when')}
        </h3>
        <p className="text-xs text-brand-component-text-gray leading-4">
          {t('this_list_of_triggers_defines_what_starts_the_automation')}.
        </p>
        <p className="text-xs text-brand-component-text-gray leading-4">
          {t(
            'a_trigger_occurs_when_the_selected_device_entity_receives_new_data_or_its_value_changes'
          )}
          .
        </p>
      </div>

      <div className="shadow-md p-4 rounded-lg">
        <FormField
          control={control}
          name="device_id"
          render={({ field }) => (
            <FormItem>
              <div className="rounded-lg border border-brand-stroke-dark-soft px-3 py-2.5">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <FormControl>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={!isEditable}
                        type="button"
                        variant="ghost"
                        role="combobox"
                        className="h-auto w-full justify-between border-0 bg-transparent p-0 text-sm font-medium shadow-none hover:bg-transparent focus-visible:ring-0"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'size-2 shrink-0 rounded-full',
                              field.value
                                ? 'bg-brand-component-text-positive'
                                : 'bg-gray-300'
                            )}
                          />
                          <span className="truncate">
                            {selectedDeviceLabel ?? t('select_device')}
                          </span>
                        </div>
                        <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                  </FormControl>

                  <PopoverContent
                    portal={false}
                    align="start"
                    sideOffset={8}
                    className="z-[9999] w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                      const target = e.target as HTMLElement
                      if (target?.closest('[role="combobox"]')) {
                        e.preventDefault()
                      }
                    }}
                  >
                    <div className="border-b p-2">
                      <InputWithIcon
                        prefixCpn={<Search size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('search_device_placeholder')}
                        className="h-8 text-sm bg-brand-component-fill-dark-soft"
                      />
                    </div>
                    <div
                      className="max-h-60 overflow-y-auto overscroll-contain p-1"
                      onScroll={handleScroll}
                      onWheelCapture={handleWheel}
                    >
                      {isLoading && deviceOptions.length === 0 && (
                        <div className="flex items-center gap-2 px-2 py-3 text-xs text-brand-component-text-gray">
                          <Loader2 className="size-3 animate-spin" />
                          <span>{t('loading_devices')}</span>
                        </div>
                      )}

                      {!isLoading && deviceOptions.length === 0 && (
                        <p className="px-2 py-3 text-xs text-brand-component-text-gray">
                          {t('no_device_found')}
                        </p>
                      )}

                      {deviceOptions.map((device) => (
                        <button
                          key={device.value}
                          type="button"
                          onClick={() => {
                            field.onChange(device.value)
                            setIsOpen(false)
                          }}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus-visible:bg-accent outline-none"
                        >
                          <Check
                            className={cn(
                              'size-4 shrink-0',
                              field.value === device.value
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <span className="truncate text-left">
                            {device.label}
                          </span>
                        </button>
                      ))}

                      {isValidating && deviceOptions.length > 0 && (
                        <div className="flex items-center justify-center gap-2 px-2 py-3 text-xs text-brand-component-text-gray">
                          <Loader2 className="size-4 animate-spin" />
                          <span>{t('loading_more_devices')}</span>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

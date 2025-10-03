import React, { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { dataTablePayload, Device } from '@/validator'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormLabel } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { DEVICES } from '../table.const'

const getDeviceNames = (devices: Device[]) => {
  return devices.map((device) => device.device_name).join(', ')
}

const Source: React.FC = () => {
  const t = useTranslations()
  const form = useFormContext<dataTablePayload>()
  const { setValue, watch } = form
  const selectedDevices = watch('source.devices') || []

  const toggleDevice = (device: (typeof DEVICES)[0]) => {
    const isSelected = selectedDevices.some(
      (d) => d.device_id === device.device_id
    )
    const updatedDevices = isSelected
      ? selectedDevices.filter((d) => d.device_id !== device.device_id)
      : [...selectedDevices, device]

    setValue('source.devices', updatedDevices)
  }

  const deviceNames = useMemo(
    () => getDeviceNames(selectedDevices),
    [selectedDevices]
  )

  return (
    <div className="mt-4 size-full px-4">
      <p className="mb-[6px] text-sm font-semibold">
        <FormLabel
          className="text-sm font-semibold !text-brand-component-text-dark"
          required
        >
          {t('dashboard.select_device')}
        </FormLabel>
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="w-full justify-between rounded-lg bg-brand-fill-dark-soft px-3 duration-200 dark:bg-brand-heading"
            variant="ghost"
          >
            <div className="flex w-full items-center justify-between text-sm text-brand-component-text-gray">
              <p className="max-w-[86%] overflow-hidden text-ellipsis whitespace-nowrap">
                {deviceNames || t('dashboard.select_device')}
              </p>
              <CaretDown />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-light-fixed shadow-lg dark:bg-brand-heading"
          align="start"
          sideOffset={4}
        >
          {DEVICES.map((device) => (
            <DropdownMenuItem
              key={device.device_id}
              className="cursor-pointer px-3 py-2 hover:bg-brand-component-fill-dark-soft"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  className="size-5 rounded border-brand-component-stroke-dark-soft px-2 peer-checked:bg-brand-component-fill-dark-soft"
                  checked={selectedDevices.some(
                    (d) => d.device_id === device.device_id
                  )}
                  onChange={() => toggleDevice(device)}
                  isError={!!form.formState.errors.source?.devices}
                />
                <Label className="text-sm text-brand-component-text-dark">
                  {device.device_name}
                </Label>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Source

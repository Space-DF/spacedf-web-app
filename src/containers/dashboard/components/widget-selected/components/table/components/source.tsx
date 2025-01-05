import React, { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { dataTablePayload } from '@/validator'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormLabel } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { DEVICES } from '../table.const'

const Source: React.FC = () => {
  const t = useTranslations()
  const { setValue, watch } = useFormContext<dataTablePayload>()
  const selectedDevices = watch('source.devices') || []

  const toggleDevice = (device: (typeof DEVICES)[0]) => {
    const isSelected = selectedDevices.some(
      (d) => d.device_id === device.device_id,
    )
    const updatedDevices = isSelected
      ? selectedDevices.filter((d) => d.device_id !== device.device_id)
      : [...selectedDevices, device]

    setValue('source.devices', updatedDevices)
  }

  return (
    <div className="mt-4 size-full px-4">
      <p className="mb-[6px] text-xs font-semibold">
        <FormLabel
          className="text-xs font-semibold !text-brand-component-text-dark"
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
            <div className="flex w-full items-center justify-between text-xs text-brand-component-text-gray">
              {t('dashboard.select_device')}
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
                    (d) => d.device_id === device.device_id,
                  )}
                  onChange={() => toggleDevice(device)}
                />
                <Label className="text-xs text-brand-component-text-dark">
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

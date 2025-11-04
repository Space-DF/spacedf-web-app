import { CaretDown } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGetDevices } from '@/hooks/useDevices'
import { useShowDummyData } from '@/hooks/useShowDummyData'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { SWITCH_DEVICES } from './constant'
import { SwitchPayload } from '@/validator'
import { useFormContext, useWatch } from 'react-hook-form'
import { cn } from '@/lib/utils'

const SwitchSource = () => {
  const t = useTranslations('dashboard')
  const form = useFormContext<SwitchPayload>()

  const selectedDeviceIds = useWatch({
    control: form.control,
    name: 'source.device_ids',
  })

  const { data: devices = [] } = useGetDevices()

  const showDummyData = useShowDummyData()

  const deviceList = showDummyData ? SWITCH_DEVICES : devices

  const deviceNames = useMemo(() => {
    return deviceList
      .filter((device) => selectedDeviceIds.includes(device.id))
      .map((device) => device.name)
      .join(', ')
  }, [deviceList, selectedDeviceIds])

  const handleSelectDevice = (deviceId: string) => {
    const deviceIds = form.getValues('source.device_ids')
    const isSelected = deviceIds.includes(deviceId)
    const updatedDeviceIds = isSelected
      ? deviceIds.filter((id) => id !== deviceId)
      : [...deviceIds, deviceId]
    form.setValue('source.device_ids', updatedDeviceIds)
  }

  const isError = form.formState.errors.source?.device_ids

  return (
    <div className="size-full">
      <FormField
        control={form.control}
        name="source.device_ids"
        render={() => (
          <FormItem>
            <p className="mb-[6px] text-sm font-semibold">
              <FormLabel
                className="text-sm font-semibold !text-brand-component-text-dark"
                required
              >
                {t('select_device')}
              </FormLabel>
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={cn(
                    'w-full justify-between rounded-lg bg-brand-fill-dark-soft px-3 duration-200 dark:bg-brand-heading',
                    isError &&
                      'ring-red-600 ring-2 ring-offset-2 bg-brand-component-fill-negative-soft'
                  )}
                  variant="ghost"
                >
                  <div className="flex w-full items-center justify-between text-sm text-brand-component-text-gray">
                    <p className="max-w-[86%] overflow-hidden text-ellipsis whitespace-nowrap">
                      {deviceNames || t('select_device')}
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
                {deviceList.length > 0 ? (
                  deviceList.map((device) => (
                    <DropdownMenuItem
                      key={device.id}
                      className="cursor-pointer px-3 py-2 hover:bg-brand-component-fill-dark-soft"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => handleSelectDevice(device.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          type="checkbox"
                          className="size-5 rounded border-brand-component-stroke-dark-soft px-2 peer-checked:bg-brand-component-fill-dark-soft"
                          checked={selectedDeviceIds.includes(device.id)}
                        />
                        <Label className="text-sm text-brand-component-text-dark">
                          {device.name}
                        </Label>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem
                    className="cursor-not-allowed px-3 py-2 hover:bg-brand-component-fill-dark-soft"
                    disabled
                  >
                    {t('no_devices_found')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default SwitchSource

import React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { FormLabel, FormField } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { DEVICES } from '../../table-widget/table.const'
import { mapPayload, mapSource, MapType } from '@/validator/map'
import { Device } from '@/validator'

const mapTypeLabels: Record<MapType, string> = {
  [MapType.RoadMap]: 'Road Map',
  [MapType.SatelLite]: 'Satellite',
}

const MapSource: React.FC = () => {
  const t = useTranslations()
  const { control, setValue } = useFormContext<mapPayload>()

  const sources =
    useWatch({
      control,
      name: 'sources',
    }) || []

  const firstSource = sources[0] || {}

  const handleUpdateDevice = (device: Device) => {
    const updatedSource: mapSource = {
      ...firstSource,
      device_id: device.device_id,
      device_name: device.device_name,
      coordinate: Array.isArray(device.coordinate) ? device.coordinate : [0, 0],
      map_type: firstSource.map_type || MapType.RoadMap,
    }
    setValue('sources', [updatedSource], { shouldValidate: true })
  }

  return (
    <div className="mt-4 size-full px-4">
      <FormField
        control={control}
        name={`sources.${0}.device_id`}
        render={({ field }) => (
          <div>
            <p className="mb-[6px] text-sm font-semibold">
              <FormLabel
                className="text-sm font-semibold !text-brand-component-text-dark"
                required
              >
                {t('dashboard.device')}
              </FormLabel>
            </p>
            <Select
              onValueChange={(value: string) => {
                const device = DEVICES.find((d) => d.device_id === value)
                if (device) {
                  handleUpdateDevice(device)
                }
              }}
            >
              <SelectTrigger className="w-full">
                {DEVICES.find((d) => d.device_id === field.value)
                  ?.device_name || t('dashboard.select_device')}
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-light-fixed shadow-lg dark:bg-brand-heading">
                {DEVICES.map((device) => (
                  <SelectItem key={device.device_id} value={device.device_id}>
                    {device.device_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />
      <FormField
        control={control}
        name={`sources.${0}.map_type`}
        render={({ field }) => (
          <div>
            <p className="mt-4 mb-[6px] text-sm font-semibold">
              <FormLabel
                className="text-sm font-semibold !text-brand-component-text-dark"
                required
              >
                {t('dashboard.map_type')}
              </FormLabel>
            </p>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                {mapTypeLabels[field.value as MapType] ||
                  t('dashboard.select_map_type')}
              </SelectTrigger>
              <SelectContent className="min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-light-fixed shadow-lg dark:bg-brand-heading">
                {Object.values(MapType).map((mapType) => (
                  <SelectItem key={mapType} value={mapType}>
                    {mapTypeLabels[mapType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />
    </div>
  )
}

export default MapSource

import React, { useCallback, useMemo } from 'react'
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
import { mapPayload, mapSource, MapType, Device } from '@/validator'

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

  const selectedSource = sources[0] || {}

  const handleDeviceChange = useCallback(
    (device: Device) => {
      const updatedSource: mapSource = {
        ...selectedSource,
        device_id: device.device_id,
        device_name: device.device_name,
        coordinate: Array.isArray(device.coordinate)
          ? device.coordinate
          : [0, 0],
        map_type: selectedSource.map_type || MapType.RoadMap,
      }
      setValue('sources', [updatedSource], { shouldValidate: true })
    },
    [selectedSource, setValue]
  )

  const mapTypeOptions = useMemo(
    () =>
      Object.values(MapType).map((mapType) => ({
        value: mapType,
        label: mapTypeLabels[mapType],
      })),
    []
  )

  return (
    <div className="mt-4 size-full px-4">
      <FormField
        control={control}
        name="sources.0.device_id"
        render={({ field }) => (
          <div>
            <p className="mb-[6px] text-sm font-semibold">
              <FormLabel required>{t('dashboard.device')}</FormLabel>
            </p>
            <Select
              onValueChange={(value) => {
                const device = DEVICES.find((d) => d.device_id === value)
                if (device) {
                  handleDeviceChange(device)
                }
              }}
            >
              <SelectTrigger className="w-full">
                {DEVICES.find((d) => d.device_id === field.value)
                  ?.device_name || t('dashboard.select_device')}
              </SelectTrigger>
              <SelectContent className="rounded-md border">
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
        name="sources.0.map_type"
        render={({ field }) => (
          <div>
            <p className="mt-4 mb-[6px] text-sm font-semibold">
              <FormLabel required>{t('dashboard.map_type')}</FormLabel>
            </p>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                {mapTypeLabels[field.value as MapType] ||
                  t('dashboard.select_map_type')}
              </SelectTrigger>
              <SelectContent className="rounded-md border">
                {mapTypeOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
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

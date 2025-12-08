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
import { mapPayload, mapSource, MapType } from '@/validator'
import { useDeviceEntity } from '../../../hooks/useDeviceEntity'
import { Entity } from '@/types/entity'

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

  const { data: entities } = useDeviceEntity('map')

  const entityList = entities?.results || []

  const selectedSource = sources[0] || {}

  const handleEntityChange = useCallback(
    (device: Entity) => {
      const updatedSource: mapSource = {
        ...selectedSource,
        entity_id: device.id,
        device_name: device.device_name,
        coordinate: [0, 0],
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

  const currentEntity = useMemo(() => {
    return entityList.find((e) => e.id === selectedSource.entity_id)
  }, [entityList, selectedSource.entity_id])

  return (
    <div className="mt-4 size-full px-4">
      <FormField
        control={control}
        name="sources.0.entity_id"
        render={() => (
          <div>
            <p className="mb-[6px] text-sm font-semibold">
              <FormLabel
                required
                className="text-xs font-semibold text-brand-component-text-dark"
              >
                {t('dashboard.device_entity')}
              </FormLabel>
            </p>
            <Select
              onValueChange={(value) => {
                const device = entityList.find((e) => e.id === value)
                if (device) {
                  handleEntityChange(device)
                }
              }}
            >
              <SelectTrigger className="w-full">
                {currentEntity
                  ? `${currentEntity?.unique_key}.${currentEntity?.entity_type.unique_key}`
                  : t('dashboard.select_entity')}
              </SelectTrigger>
              <SelectContent className="rounded-md border">
                {entityList.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {`${entity.unique_key}.${entity.entity_type.unique_key}`}
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
              <FormLabel
                className="text-xs font-semibold text-brand-component-text-dark"
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

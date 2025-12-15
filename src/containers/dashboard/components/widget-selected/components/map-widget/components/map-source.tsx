import React, { useCallback, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FormLabel, FormField } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { mapPayload, mapSource, MapType } from '@/validator'
import { useDeviceEntity } from '../../../hooks/useDeviceEntity'
import { Entity } from '@/types/entity'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks'
import { Skeleton } from '@/components/ui/skeleton'

const mapTypeLabels: Record<MapType, string> = {
  [MapType.RoadMap]: 'Road Map',
  [MapType.SatelLite]: 'Satellite',
}

const MapSource: React.FC = () => {
  const [entityName, setEntityName] = useState('')
  const entityNameDebounce = useDebounce(entityName)
  const t = useTranslations('dashboard')
  const { control, setValue } = useFormContext<mapPayload>()

  const [openCombobox, setOpenCombobox] = useState(false)

  const sources =
    useWatch({
      control,
      name: 'sources',
    }) || []

  const { data: entities, isLoading } = useDeviceEntity(
    'map',
    entityNameDebounce
  )

  const entityList = entities?.results || []

  const selectedSource = sources[0] || {}

  const handleEntityChange = useCallback(
    (device: Entity) => {
      const updatedSource: mapSource = {
        ...selectedSource,
        entity_id: device.unique_key,
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
        render={({ field }) => (
          <div>
            <p className="mb-[6px] text-sm font-semibold">
              <FormLabel
                required
                className="text-xs font-semibold text-brand-component-text-dark"
              >
                {t('device_entity')}
              </FormLabel>
            </p>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="font-normal text-sm w-full justify-between border-none bg-brand-component-fill-dark-soft outline-none ring-0 hover:bg-brand-component-fill-dark-soft focus:ring-0 dark:bg-brand-heading dark:hover:bg-brand-heading"
                >
                  <p className="truncate w-5/6 text-start">
                    {currentEntity
                      ? `${currentEntity?.unique_key} - ${currentEntity.device_name}`
                      : t('select_entity')}
                  </p>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                <Command
                  className="bg-brand-component-fill-light-fixed dark:bg-brand-heading"
                  shouldFilter={false}
                >
                  <CommandInput
                    placeholder={t('search_entity')}
                    className="h-9"
                    onValueChange={(value) => setEntityName(value)}
                  />
                  <CommandList>
                    {isLoading ? (
                      <div className="p-2 space-y-2">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Skeleton
                            key={idx}
                            className="h-4 w-full bg-brand-component-fill-gray-soft"
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>{t('no_devices_found')}</CommandEmpty>
                        <CommandGroup>
                          {entityList.length > 0 &&
                            entityList.map((entity) => (
                              <CommandItem
                                key={entity.id}
                                value={entity.unique_key}
                                onSelect={() => {
                                  handleEntityChange(entity)
                                  setOpenCombobox(false)
                                }}
                                className="data-[selected=true]:bg-brand-component-fill-gray-soft"
                              >
                                {`${entity.unique_key} - ${entity.device_name}`}
                                <Check
                                  className={cn(
                                    'ml-auto size-4',
                                    field.value === entity.unique_key
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
                {t('map_type')}
              </FormLabel>
            </p>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                className="w-full font-normal text-sm justify-between border-none bg-brand-component-fill-dark-soft outline-none ring-0 hover:bg-brand-component-fill-dark-soft focus:ring-0 dark:bg-brand-heading dark:hover:bg-brand-heading"
                icon={<ChevronDown className="w-3 text-brand-icon-gray" />}
              >
                {mapTypeLabels[field.value as MapType] || t('select_map_type')}
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

import { useTranslations } from 'next-intl'
import React, { ChangeEvent, useMemo, useState } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { GaugePayload, gaugeValue } from '@/validator'
import { Select } from '@/components/ui/select'
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
import { Check, ChevronDown, PlusIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { GaugeType } from '@/widget-models/gauge'
import ColorSelect from '../../color-select'
import { Button } from '@/components/ui/button'
import XCircle from '@/components/icons/x-circle'
import { useDeviceEntity } from '../../../hooks/useDeviceEntity'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks'
import { Skeleton } from '@/components/ui/skeleton'

const Source = () => {
  const t = useTranslations('dashboard')
  const form = useFormContext<GaugePayload>()
  const { control, setValue } = form
  const {
    append,
    remove,
    fields: values,
  } = useFieldArray({
    control,
    name: 'source.values',
  })
  const [entityName, setEntityName] = useState('')
  const entityNameDebounce = useDebounce(entityName)

  const entityId = form.watch('source.entity_id')

  const [openCombobox, setOpenCombobox] = useState(false)

  const [min, max] = useWatch({
    control,
    name: ['source.min', 'source.max'],
  })

  const { data: entities, isLoading } = useDeviceEntity(
    'gauge',
    entityNameDebounce
  )

  const handleAddValue = () => {
    append(gaugeValue)
  }

  const handleRemoveValue = (index: number) => {
    remove(index)
  }

  const handleValueChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValue = e.target.value
    const numericValue = Number(inputValue)
    if (inputValue === '') {
      setValue(`source.values.${index}.value`, 0)
      return
    }
    if (isNaN(numericValue)) return
    if (numericValue > max) return setValue(`source.values.${index}.value`, max)
    if (numericValue < min) return setValue(`source.values.${index}.value`, min)
    setValue(`source.values.${index}.value`, numericValue)
  }

  const handleDecimalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = Number(inputValue)
    if (inputValue === '') {
      setValue('source.decimal', 0)
      return
    }
    if (isNaN(numericValue)) return
    if (numericValue > 10) return setValue('source.decimal', 10)
    if (numericValue < 0) return setValue('source.decimal', 0)
    setValue('source.decimal', numericValue)
  }

  const handleUnitChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length > 10) return
    setValue('source.unit', value)
  }

  const entityList = entities?.results || []

  const currentEntity = useMemo(() => {
    return entityList.find((entity) => entity.unique_key === entityId)
  }, [entityList, entityId])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 gap-y-4">
        <FormField
          control={control}
          name="source.entity_id"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel
                className="text-xs font-semibold text-brand-component-text-dark"
                required
              >
                {t('device_entity')}
              </FormLabel>
              <FormControl>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className=" w-full justify-between border-none bg-brand-component-fill-dark-soft outline-none ring-0 hover:bg-brand-component-fill-dark-soft focus:ring-0 dark:bg-brand-heading dark:hover:bg-brand-heading font-normal text-sm"
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
                                      field.onChange(entity.unique_key)
                                      setOpenCombobox(false)
                                    }}
                                    className="data-[selected=true]:bg-brand-component-fill-gray-soft"
                                  >
                                    {`${entity.unique_key} - ${entity.device_name}`}
                                    <Check
                                      className={cn(
                                        'ml-auto h-4 w-4',
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="source.min"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                {t('min')}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="source.max"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                {t('max')}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="source.decimal"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                {t('decimal_places')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={handleDecimalChange}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="source.unit"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                {t('unit')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={handleUnitChange}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="source.type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
              {t('type')}
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-3 gap-3"
              >
                {Object.values(GaugeType).map((type) => (
                  <FormItem
                    className="flex items-center space-x-3 space-y-0"
                    key={type}
                  >
                    <FormControl>
                      <RadioGroupItem value={type} />
                    </FormControl>
                    <FormLabel className="font-medium text-sm text-brand-component-text-dark">
                      {t(type as any)}
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={`source`}
      >
        <AccordionItem
          value={`source`}
          className="overflow-hidden rounded-sm border border-brand-component-stroke-dark-soft"
        >
          <AccordionTrigger
            className="border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft p-3 text-sm font-semibold hover:no-underline"
            dropdownIcon={
              <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
            }
          >
            {t('values')}
          </AccordionTrigger>
          <AccordionContent className="p-3 space-y-4">
            {values.map((value, index) => (
              <div
                className="grid grid-cols-9 gap-4 items-start"
                key={value.id}
              >
                <FormField
                  control={control}
                  name={`source.values.${index}.value`}
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-4">
                      <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                        {t('value')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => handleValueChange(e, index)}
                          isError={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`source.values.${index}.color`}
                  render={({ field }) => (
                    <FormItem className="col-span-5">
                      <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                        {t('color')}
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <ColorSelect fieldValue={field.value} />
                          </Select>
                          <XCircle
                            className="cursor-pointer"
                            onClick={() => handleRemoveValue(index)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button className="space-x-2" onClick={handleAddValue}>
              <span>{t('add')}</span>
              <PlusIcon className="size-4" />
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default Source

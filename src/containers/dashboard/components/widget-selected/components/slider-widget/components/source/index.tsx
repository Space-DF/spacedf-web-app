import React, { ChangeEvent, useMemo, useState } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
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
import { Check, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { SliderPayload } from '@/validator'
import { useDeviceEntity } from '../../../../hooks/useDeviceEntity'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const handleChangeInputNumber = (value: string) => {
  if (value === '' || isNaN(+value)) {
    return 0
  }
  return +value
}

const SliderSource = () => {
  const form = useFormContext<SliderPayload>()
  const { control } = form

  const { data: entities } = useDeviceEntity('slider')
  const entityId = form.watch('source.entity_id')

  const [openCombobox, setOpenCombobox] = useState(false)

  const entityList = entities?.results || []

  const currentEntity = useMemo(() => {
    return entities?.results.find((entity) => entity.id === entityId)
  }, [entities, entityId])

  const t = useTranslations('dashboard')

  const [max, min] = form.watch(['source.max', 'source.min'])

  const handleChangeMin = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const min = handleChangeInputNumber(value)
    if (min > max) {
      return form.setValue('source.min', max)
    }
    form.setValue('source.min', min)
  }
  const handleChangeMax = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const max = handleChangeInputNumber(value)
    if (max < min) {
      return form.setValue('source.max', min)
    }
    form.setValue('source.max', max)
  }

  const handleChangeStep = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || isNaN(+value)) {
      return form.setValue('source.step', 1)
    }
    if (+value > max) {
      return form.setValue('source.step', max)
    }
    if (+value < min) {
      return form.setValue('source.step', min)
    }
    form.setValue('source.step', +value)
  }

  return (
    <div className="space-y-4 mb-2">
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
                      className="font-normal text-sm w-full justify-between border-none bg-brand-component-fill-dark-soft outline-none ring-0 hover:bg-brand-component-fill-dark-soft focus:ring-0 dark:bg-brand-heading dark:hover:bg-brand-heading"
                    >
                      <p className="truncate w-5/6 text-start">
                        {currentEntity
                          ? `${currentEntity?.unique_key}.${currentEntity?.entity_type.unique_key}`
                          : t('select_entity')}
                      </p>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                    <Command className="bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                      <CommandInput
                        placeholder={t('search_entity')}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>{t('no_devices_found')}</CommandEmpty>
                        <CommandGroup>
                          {entityList.length > 0 &&
                            entityList.map((entity) => (
                              <CommandItem
                                key={entity.id}
                                value={`${entity.unique_key}.${entity.entity_type.unique_key}`}
                                onSelect={() => {
                                  field.onChange(entity.id)
                                  setOpenCombobox(false)
                                }}
                                className="data-[selected=true]:bg-brand-component-fill-gray-soft"
                              >
                                {`${entity.unique_key}.${entity.entity_type.unique_key}`}
                                <Check
                                  className={cn(
                                    'ml-auto size-4',
                                    field.value === entity.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="source.min"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              className="text-xs font-semibold text-brand-component-text-dark"
              required
            >
              {t('value_from')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                isError={!!fieldState.error}
                onChange={handleChangeMin}
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
            <FormLabel
              className="text-xs font-semibold text-brand-component-text-dark"
              required
            >
              {t('value_to')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                isError={!!fieldState.error}
                onChange={handleChangeMax}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="source.step"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
              {t('step')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                isError={!!fieldState.error}
                onChange={handleChangeStep}
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
              <Input {...field} isError={!!fieldState.error} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default SliderSource

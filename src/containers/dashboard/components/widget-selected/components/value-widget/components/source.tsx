import React, { ChangeEvent } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ValuePayload } from '@/validator'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { useDeviceEntity } from '../../../hooks/useDeviceEntity'

const Source = () => {
  const form = useFormContext<ValuePayload>()
  const { control } = form

  const { data: entities } = useDeviceEntity('value')
  const entityList = entities?.results || []
  const t = useTranslations('dashboard')

  const handleDecimalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = Number(inputValue)
    if (inputValue === '') {
      form.setValue('source.decimal', 0)
      return
    }
    if (isNaN(numericValue)) return
    if (numericValue > 10) return form.setValue('source.decimal', 10)
    if (numericValue < 0) return form.setValue('source.decimal', 0)
    form.setValue('source.decimal', numericValue)
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    icon={<ChevronDown className="w-3 text-brand-icon-gray" />}
                    className="w-full border-none bg-brand-component-fill-dark-soft outline-none ring-0 focus:ring-0 dark:bg-brand-heading"
                  >
                    <SelectValue
                      placeholder={
                        <span className="text-brand-component-text-gray">
                          {t('select_entity')}
                        </span>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-component-fill-dark-soft dark:bg-brand-heading">
                    <SelectGroup>
                      {entityList.length > 0 ? (
                        entityList.map((entity) => (
                          <SelectItem value={entity.id} key={entity.id}>
                            {`${entity.unique_key}.${entity.entity_type.unique_key}`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_entity" key="no_entity" disabled>
                          {t('no_entities_found')}
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
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
    </div>
  )
}

export default Source

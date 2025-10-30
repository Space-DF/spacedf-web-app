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
import { useGetDevices } from '@/hooks/useDevices'

const mockFieldData = [
  {
    id: '1',
    name: 'water_level',
  },
  {
    id: '2',
    name: 'temperature',
  },
]

const Source = () => {
  const form = useFormContext<ValuePayload>()
  const { control } = form

  const { data: devices = [] } = useGetDevices()

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
          name="source.device_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="text-xs font-semibold text-brand-component-text-dark"
                required
              >
                {t('device')}
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
                          {t('select_device')}
                        </span>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-component-fill-dark-soft dark:bg-brand-heading">
                    <SelectGroup>
                      {devices.length > 0 ? (
                        devices.map((device) => (
                          <SelectItem value={device.id} key={device.id}>
                            {device.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_device" key="no_device" disabled>
                          {t('no_devices_found')}
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
        <FormField
          control={control}
          name="source.field"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="text-xs font-semibold text-brand-component-text-dark"
                required
              >
                {t('field')}
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
                          {t('select_field')}
                        </span>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-component-fill-dark-soft dark:bg-brand-heading">
                    <SelectGroup>
                      {mockFieldData.map((device) => (
                        <SelectItem value={device.id} key={device.id}>
                          {t(device.name as any)}
                        </SelectItem>
                      ))}
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

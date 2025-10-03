import React from 'react'
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
import { mockDeviceData } from '../../chart-widget/components/single-source'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'

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
  const t = useTranslations('dashboard')
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
                      {mockDeviceData.map((device) => (
                        <SelectItem value={device.id} key={device.id}>
                          {device.name}
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
                min={0}
                max={10}
                type="number"
                {...field}
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

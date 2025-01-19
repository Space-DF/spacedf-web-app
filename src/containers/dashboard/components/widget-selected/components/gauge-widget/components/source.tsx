import { useTranslations } from 'next-intl'
import React from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import { GaugePayload } from '@/validator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'
import { mockDeviceData } from '../../chart-widget/components/single-source'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { GaugeType } from '@/widget-models/gauge'

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
  const t = useTranslations('dashboard')
  const form = useFormContext<GaugePayload>()
  const { control } = form
  return (
    <div className="space-y-4">
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
        <FormField
          control={control}
          name="source.min"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                {t('min')}
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="source.max"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                {t('max')}
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="source.decimal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                {t('decimal_places')}
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="source.unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                {t('unit')}
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
            <FormLabel>{t('type')}</FormLabel>
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
    </div>
  )
}

export default Source

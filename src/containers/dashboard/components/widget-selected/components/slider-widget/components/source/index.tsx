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
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { useGetDevices } from '@/hooks/useDevices'
import { SliderPayload } from '@/validator'
import { mockFieldData } from '../../../chart-widget/components/single-source'
import { useShowDummyData } from '@/hooks/useShowDummyData'
import { SLIDER_DEVICES } from './constants'

const handleChangeInputNumber = (value: string) => {
  if (value === '' || isNaN(+value)) {
    return 0
  }
  return +value
}

const SliderSource = () => {
  const form = useFormContext<SliderPayload>()
  const { control } = form

  const { data: devices = [] } = useGetDevices()

  const showDummyData = useShowDummyData()

  const deviceList = showDummyData ? SLIDER_DEVICES : devices

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
          name="source.device_id"
          render={({ field, fieldState }) => (
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
                    isError={!!fieldState.error}
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
                      {deviceList.length > 0 ? (
                        deviceList.map((device) => (
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
          render={({ field, fieldState }) => (
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
                    isError={!!fieldState.error}
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

import { cn } from '@/lib/utils'
import { ValuePayload, ValueTimeFrameType } from '@/validator'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import dayjs from 'dayjs'
import { TIME_ZONE, TimeFormat } from '@/constants'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

const mockOperationTimeFrame = [
  {
    id: '1',
    name: 'Morning Shift',
  },
  {
    id: '2',
    name: 'Afternoon Shift',
  },
  {
    id: '3',
    name: 'Night Shift',
  },
  {
    id: '4',
    name: 'Maintenance Window',
  },
]

const Timeframe = () => {
  const t = useTranslations('dashboard')
  const { control, setValue } = useFormContext<ValuePayload>()

  const [isUtilOpen, setIsUtilOpen] = useState(false)
  const [isFromOpen, setIsFromOpen] = useState(false)

  const [type, from, until] = useWatch({
    control,
    name: ['timeframe.type', 'timeframe.from', 'timeframe.until'],
  })

  const handleSelectTimeFrameType = (type: ValueTimeFrameType) => {
    setValue('timeframe.type', type)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div
          className={cn(
            'space-y-2 border-brand-component-stroke-dark-soft border rounded-lg px-3 py-4 pb-8 cursor-pointer transition duration-300 hover:border-brand-component-stroke-dark hover:border-2',
            type === ValueTimeFrameType.Current &&
              'border-brand-component-stroke-dark border-2'
          )}
          onClick={() => handleSelectTimeFrameType(ValueTimeFrameType.Current)}
        >
          <div className="h-5">
            <span className="text-[14px] font-semibold h-5">
              {t('current_value')}
            </span>
          </div>
          <div className="h-4">
            <span className="text-brand-component-text-gray text-xs">
              {t('show_latest')}
            </span>
          </div>
        </div>
        <div
          className={cn(
            'space-y-2 border-brand-component-stroke-dark-soft border rounded-lg px-3 py-4 pb-8 cursor-pointer hover:border-brand-component-stroke-dark hover:border-2',
            type === ValueTimeFrameType.TimeRange &&
              'border-brand-component-stroke-dark border-2'
          )}
          onClick={() =>
            handleSelectTimeFrameType(ValueTimeFrameType.TimeRange)
          }
        >
          <div className="h-5">
            <span className="text-[14px] font-semibold h-5 line-clamp-1">
              {t('timerange_operation')}
            </span>
          </div>
          <div className="h-4">
            <span className="text-brand-component-text-gray text-xs line-clamp-2">
              {t('custom_timerange')}
            </span>
          </div>
        </div>
      </div>
      {type === ValueTimeFrameType.TimeRange && (
        <div className="animate-opacity-display-effect space-y-4">
          <FormField
            control={control}
            name="timeframe.operation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                  {t('operation')}
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      icon={
                        <ChevronDown className="w-3 text-brand-icon-gray" />
                      }
                      className="w-full border-none bg-brand-component-fill-dark-soft outline-none ring-0 focus:ring-0 dark:bg-brand-heading"
                    >
                      <SelectValue
                        placeholder={
                          <span className="text-brand-component-text-gray">
                            {t('none_select')}
                          </span>
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-component-fill-dark-soft dark:bg-brand-heading">
                      <SelectGroup>
                        {mockOperationTimeFrame.map((operation) => (
                          <SelectItem value={operation.id} key={operation.id}>
                            {operation.name}
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
            name="timeframe.from"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                  {t('from')}
                </FormLabel>
                <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'bg-brand-component-fill-dark-soft pl-3 text-left text-sm font-medium text-brand-component-text-dark',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          dayjs(field.value).format(
                            TimeFormat.FULL_DATE_WITH_ORDINAL
                          )
                        ) : (
                          <span>{t('pick_a_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto bg-brand-component-fill-dark-soft p-0 text-brand-component-text-dark"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date)
                        setIsFromOpen(false)
                      }}
                      disabled={(date) => (until ? date > until : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="timeframe.until"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                  {t('until')}
                </FormLabel>
                <Popover open={isUtilOpen} onOpenChange={setIsUtilOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'bg-brand-component-fill-dark-soft pl-3 text-left text-sm font-medium text-brand-component-text-dark',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          dayjs(field.value).format(
                            TimeFormat.FULL_DATE_WITH_ORDINAL
                          )
                        ) : (
                          <span>{t('pick_a_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto bg-brand-component-fill-dark-soft p-0 text-brand-component-text-dark"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date)
                        setIsUtilOpen(false)
                      }}
                      disabled={(date) => (from ? date < from : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="timeframe.time_zone"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                  {t('time_zone')}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className="border-none bg-brand-component-fill-dark-soft outline-none ring-0 focus:ring-0 dark:dark:bg-brand-heading"
                      icon={
                        <ChevronDown className="w-3 text-brand-icon-gray" />
                      }
                    >
                      <SelectValue
                        placeholder={
                          <span className="text-brand-component-text-gray">
                            {t('none_select')}
                          </span>
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIME_ZONE.map((zone) => (
                      <SelectItem key={zone.value} value={zone.value}>
                        {zone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default Timeframe

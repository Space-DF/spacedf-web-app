import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'
import { ChartPayload } from '@/validator'
import { AggregationFunction, TimeFrameTab } from '@/widget-models/widget'
import dayjs from 'dayjs'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { TIME_ZONE, TimeFormat } from '@/constants'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ResolutionUnit } from '@/widget-models/widget'
import Info from '@/components/icons/info'
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const TIME_FRAME_TABS = [
  {
    value: TimeFrameTab.Hour,
    label: 'hour',
  },

  {
    value: TimeFrameTab.Day,
    label: 'day',
  },
  {
    value: TimeFrameTab.Week,
    label: 'week',
  },
  {
    value: TimeFrameTab.Month,
    label: 'month',
  },
  {
    value: TimeFrameTab.Custom,
    label: 'custom',
  },
]

const TimeFrame = () => {
  const form = useFormContext<ChartPayload>()
  const t = useTranslations('dashboard')
  const [isFromOpen, setIsFromOpen] = useState(false)
  const [isUtilOpen, setIsUtilOpen] = useState(false)
  const { watch } = form
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentWidth, setCurrentWidth] = useState(0)

  const [from, until] = watch(['timeframe.from', 'timeframe.until'])

  const handleTabChange = (tab: TimeFrameTab) => {
    const now = dayjs()
    let from: Date
    let until: Date
    if (tab === TimeFrameTab.Custom) {
      return form.reset((prev) => ({
        ...prev,
        timeframe: {
          ...prev.timeframe,
          from,
          until,
          resolution_unit: ResolutionUnit.Minutes,
          type: TimeFrameTab.Custom,
        },
      }))
    }

    switch (tab) {
      case TimeFrameTab.Hour:
        from = now.startOf('hour').toDate()
        until = now.endOf('hour').toDate()
        break
      case TimeFrameTab.Day:
        from = now.startOf('day').toDate()
        until = now.endOf('day').toDate()
        break
      case TimeFrameTab.Week:
        from = now.startOf('week').toDate()
        until = now.endOf('week').toDate()
        break
      case TimeFrameTab.Month:
        from = now.startOf('month').toDate()
        until = now.endOf('month').toDate()
        break
    }
    form.reset((prev) => ({
      ...prev,
      timeframe: {
        aggregation_function: prev.timeframe.aggregation_function,
        from,
        until,
        type: tab,
      },
    }))
  }

  const activeTab = form.watch('timeframe.type')

  const isCustomTab = useMemo(
    () => activeTab === TimeFrameTab.Custom,
    [activeTab]
  )

  const isLgContainer = currentWidth > 320

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setCurrentWidth(containerRef.current.clientWidth)
      }
    })
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  return (
    <Tabs
      value={activeTab}
      onValueChange={(tab) => handleTabChange(tab as TimeFrameTab)}
      ref={containerRef}
    >
      <TabsList className="m-0 grid h-fit w-full grid-cols-5 gap-0 divide-x overflow-hidden border border-brand-component-stroke-dark-soft bg-transparent p-0">
        {TIME_FRAME_TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none text-brand-component-text-dark data-[state=active]:border-brand-component-stroke-dark data-[state=active]:bg-brand-component-fill-dark data-[state=active]:text-brand-component-text-light"
          >
            {t(tab.label as any)}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-4 space-y-4">
        {isCustomTab ? (
          <>
            <FormField
              control={form.control}
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
                        selected={new Date(field.value)}
                        onSelect={(date) => {
                          field.onChange(date)
                          setIsFromOpen(false)
                        }}
                        disabled={(date) => date > until}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
                        selected={new Date(field.value)}
                        onSelect={(date) => {
                          field.onChange(date)
                          setIsUtilOpen(false)
                        }}
                        disabled={(date) => date < from}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeframe.resolution"
              render={({ field, fieldState }) => (
                <>
                  <FormItem className="relative flex flex-col">
                    <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                      {t('resolution')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-input"
                        {...field}
                        isError={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormField
                      control={form.control}
                      name="timeframe.resolution_unit"
                      render={({ field }) => (
                        <FormItem className="absolute right-1 top-[23px]">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className="border-none shadow-none bg-brand-fill-dark-soft border-brand-stroke-dark-soft border border-l-0 p-0 focus:outline-none focus:ring-0 outline-none ring-0 h-7 dark:bg-brand-heading "
                                icon={
                                  <ChevronDown className="w-3 text-brand-icon-gray" />
                                }
                              >
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ResolutionUnit.Minutes}>
                                {t('minutes')}
                              </SelectItem>
                              <SelectItem value={ResolutionUnit.Hours}>
                                {t('hour')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormItem>
                </>
              )}
            />

            <FormField
              control={form.control}
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
                        <SelectValue placeholder={t('none_select')} />
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
          </>
        ) : (
          <></>
        )}

        <FormField
          control={form.control}
          name="timeframe.aggregation_function"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="flex items-center space-x-1.5 text-sm font-semibold text-brand-component-text-dark">
                <span>{t('aggregation_function')}</span>{' '}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Info className="cursor-pointer" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-96 border-none">
                      <p>{t('aggregation_function_info')}</p>
                      <TooltipArrow className="z-10 fill-popover text-popover" />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className={cn(
                    'flex',
                    isLgContainer
                      ? 'space-x-3 items-center'
                      : 'gap-y-1 flex-col'
                  )}
                >
                  <FormItem className="m-2 flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={AggregationFunction.Minimum} />
                    </FormControl>
                    <FormLabel className="cursor-pointer text-sm font-medium text-brand-component-text-dark">
                      {t('minimum')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="m-2 flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={AggregationFunction.Average} />
                    </FormControl>
                    <FormLabel className="cursor-pointer text-sm font-medium text-brand-component-text-dark">
                      {t('average')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="m-2 flex cursor-pointer items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={AggregationFunction.Maximum} />
                    </FormControl>
                    <FormLabel className="text-sm font-medium text-brand-component-text-dark">
                      {t('maximum')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Tabs>
  )
}

export default TimeFrame

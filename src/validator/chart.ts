import { TimeFormat } from '@/constants'
import { ChartType, Orientation } from '@/widget-models/chart'
import {
  AggregationFunction,
  ResolutionUnit,
  TimeFrameTab,
} from '@/widget-models/widget'
import dayjs from 'dayjs'
import { z } from 'zod'

export const chartSchema = z
  .object({
    sources: z.array(
      z.object({
        entity_id: z.string().min(1, { message: 'Please select entity' }),
        legend: z.string(),
        color: z.string(),
        show_legend: z.boolean(),
        chart_type: z.enum(Object.values(ChartType) as [string, ...string[]]),
      })
    ),
    widget_info: z.object({
      name: z
        .string()
        .min(1, { message: 'Please enter widget name' })
        .max(100, { message: 'Maximum 100 characters long!' }),
      appearance: z.object({
        show_value: z.boolean(),
      }),
    }),
    axes: z.object({
      y_axis: z.object({
        orientation: z.enum([Orientation.Left, Orientation.Right]),
        unit: z.string().max(50, 'Maximum 50 characters').optional(),
      }),
      hide_axis: z.boolean(),
      is_show_grid: z.boolean(),
      format: z.string(),
    }),
    timeframe: z.object({
      from: z.date({ required_error: 'Please select date from' }),
      until: z.date({ required_error: 'Please select date until' }),
      resolution: z
        .number({ invalid_type_error: 'Only numbers are allowed' })
        .optional(),
      type: z.enum(
        [
          TimeFrameTab.Day,
          TimeFrameTab.Hour,
          TimeFrameTab.Month,
          TimeFrameTab.Week,
          TimeFrameTab.Custom,
        ],
        { required_error: 'Please select aggregation function' }
      ),
      resolution_unit: z
        .enum([ResolutionUnit.Minutes, ResolutionUnit.Hours])
        .optional(),
      time_zone: z.string().optional(),
      aggregation_function: z.enum([
        AggregationFunction.Average,
        AggregationFunction.Minimum,
        AggregationFunction.Maximum,
      ]),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.timeframe.type === TimeFrameTab.Custom) {
      if (!data.timeframe.resolution) {
        return ctx.addIssue({
          path: ['resolution'],
          message: 'Please enter resolution',
          code: z.ZodIssueCode.custom,
        })
      }
      if (!data.timeframe.resolution_unit) {
        return ctx.addIssue({
          path: ['resolution_unit'],
          message: 'Please select resolution unit',
          code: z.ZodIssueCode.custom,
        })
      }
      if (!data.timeframe.time_zone) {
        return ctx.addIssue({
          path: ['time_zone'],
          message: 'Please select time zone',
          code: z.ZodIssueCode.custom,
        })
      }
    }
  })

export type ChartPayload = z.infer<typeof chartSchema>

export const defaultSourceChartValues: ChartPayload['sources'] = [
  {
    entity_id: '1',
    legend: 'Temperature',
    color: 'default',
    chart_type: ChartType.LineChart,
    show_legend: true,
  },
]

export const defaultChartValues: ChartPayload = {
  sources: defaultSourceChartValues,
  widget_info: {
    name: 'New chart widget',
    appearance: {
      show_value: true,
    },
  },
  axes: {
    y_axis: {
      unit: '',
      orientation: Orientation.Left,
    },
    hide_axis: false,
    is_show_grid: false,
    format: TimeFormat.FULL_DATE_MONTH_YEAR,
  },
  timeframe: {
    aggregation_function: AggregationFunction.Average,
    from: dayjs().startOf('hour').toDate(),
    until: dayjs().endOf('hour').toDate(),
    type: TimeFrameTab.Hour,
  },
}

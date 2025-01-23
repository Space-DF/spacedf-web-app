import { GaugeType } from '@/widget-models/gauge'
import {
  AggregationFunction,
  ResolutionUnit,
  TimeFrameTab,
} from '@/widget-models/widget'
import { z } from 'zod'

export const gaugeSchema = z.object({
  source: z
    .object({
      device_id: z.string({
        required_error: 'Please select device',
      }),
      field: z.string({ required_error: 'Please select field' }),
      min: z.number(),
      max: z.number(),
      decimal: z.coerce
        .number({ invalid_type_error: 'Only numbers are allowed' })
        .min(0, 'Decimal Places must larger than 0')
        .max(10, 'Decimal Places must less than 10'),
      unit: z.string().optional(),
      type: z.enum(Object.values(GaugeType) as [string, ...string[]]),
      values: z.array(
        z.object({
          value: z.coerce.number({
            invalid_type_error: 'Only numbers are allowed',
          }),
          color: z.string(),
        })
      ),
    })
    .superRefine((data, ctx) => {
      const { max, min, values } = data
      values.forEach((item, index) => {
        if (item.value > max) {
          ctx.addIssue({
            path: ['values', index, 'value'],
            message: 'Value must be smaller than max',
            code: z.ZodIssueCode.custom,
          })
        }
        if (item.value < min) {
          ctx.addIssue({
            path: ['values', index, 'value'],
            message: 'Value must be larger than min',
            code: z.ZodIssueCode.custom,
          })
        }
      })
    }),
  timeframe: z.object({
    from: z.date({ required_error: 'Please select date from' }).optional(),
    until: z.date({ required_error: 'Please select date until' }).optional(),
    resolution: z
      .string()
      .regex(/^\d*$/, 'Only numbers are allowed')
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
  widget_info: z.object({
    name: z
      .string()
      .min(1, 'Widget name is require')
      .max(100, 'Maximum 100 characters long'),
    appearance: z.object({
      show_state: z.boolean(),
      show_value: z.boolean(),
    }),
  }),
})

export type GaugePayload = z.infer<typeof gaugeSchema>

export type GaugeValue = {
  color: string
  value: number
}

export const gaugeValue: GaugeValue = {
  color: 'default',
  value: 0,
}

export const defaultGaugeValues: GaugePayload = {
  source: {
    device_id: '1',
    field: '1',
    min: 0,
    max: 100,
    decimal: 0,
    type: GaugeType.Linear,
    values: [],
  },
  timeframe: {
    type: TimeFrameTab.Day,
    aggregation_function: AggregationFunction.Minimum,
  },
  widget_info: {
    name: 'New Gauge Widget',
    appearance: {
      show_state: true,
      show_value: true,
    },
  },
}

import { GaugeType } from '@/widget-models/gauge'
import {
  AggregationFunction,
  ResolutionUnit,
  TimeFrameTab,
} from '@/widget-models/widget'
import { z } from 'zod'

export const gaugeSchema = z.object({
  source: z.object({
    device_id: z.string({
      required_error: 'Please select device',
    }),
    field: z.string({ required_error: 'Please select field' }),
    min: z.number({ invalid_type_error: 'Min must be a number' }),
    max: z.number({ invalid_type_error: 'Max must be a number' }),
    decimal: z.number({
      invalid_type_error: 'Decimal Places must be a number',
    }),
    unit: z.string({ required_error: 'Please select unit' }),
    type: z.enum(Object.values(GaugeType) as [string, ...string[]]),
    values: z.array(
      z.object({
        value: z.number(),
        color: z.string(),
      })
    ),
  }),
  timeframe: z.object({
    from: z.date({ required_error: 'Please select date from' }),
    until: z.date({ required_error: 'Please select date until' }),
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
})

export type GaugePayload = z.infer<typeof gaugeSchema>

export const gaugeDefaultValues = {
  timeframe: {
    type: TimeFrameTab.Day,
    aggregation_function: AggregationFunction.Minimum,
  },
}

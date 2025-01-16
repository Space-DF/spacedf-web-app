import { GaugeType } from '@/widget-models/gauge'
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
})

export type GaugePayload = z.infer<typeof gaugeSchema>

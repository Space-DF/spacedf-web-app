import { z } from 'zod'

export enum ValueTimeFrameType {
  Current = 'current',
  TimeRange = 'time-range',
}

export const valueSchema = z.object({
  source: z.object({
    entity_id: z.string({
      required_error: 'Please select entity',
    }),
    unit: z.string().optional(),
    decimal: z.coerce
      .number({
        invalid_type_error: 'Decimal Places must be a number',
      })
      .min(0, 'Decimal Places must be larger than 0')
      .max(10, 'Decimal Places must be smaller than 10')
      .optional(),
  }),
  widget_info: z.object({
    name: z
      .string()
      .min(1, 'Widget name is required')
      .max(100, 'Maximum 100 characters long'),
    appearance: z.object({
      show_state: z.boolean(),
    }),
    color: z.string({ required_error: 'Please select color' }),
  }),
  timeframe: z.object({
    type: z.enum([ValueTimeFrameType.Current, ValueTimeFrameType.TimeRange]),
    operation: z
      .string({ required_error: 'Please select operation' })
      .optional(),
    from: z.date({ required_error: 'Please select date from' }).optional(),
    until: z.date({ required_error: 'Please select date until' }).optional(),
    time_zone: z.string().optional(),
  }),
})

export type ValuePayload = z.infer<typeof valueSchema>

export const defaultValueWidgetValues: ValuePayload = {
  source: {
    entity_id: '1',
    decimal: 0,
  },
  widget_info: {
    name: 'New Value Widget',
    appearance: {
      show_state: true,
    },
    color: 'default',
  },
  timeframe: {
    type: ValueTimeFrameType.Current,
  },
}

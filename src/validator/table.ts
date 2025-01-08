import { z } from 'zod'

export const sourceSchema = z.object({
  devices: z
    .array(
      z
        .object({
          device_id: z.string().min(1, 'Device ID is required'),
          device_name: z.string().optional(),
        })
        .passthrough(),
    )
    .min(1, 'At least one device is required'),
})

export const dataTableSchema = z.object({
  source: sourceSchema,
  columns: z.array(
    z.object({
      column_name: z
        .string()
        .min(1, { message: 'Please enter column name' })
        .max(50, { message: 'Maximum 50 characters longs!' }),
      field: z.string().min(1, { message: `Can't be empty!` }),
      type: z.enum(['General', 'Specific'], {
        required_error: 'Type is required',
      }),
    }),
  ),
  widget_info: z.object({
    name: z
      .string()
      .min(1, { message: 'Please enter widget name' })
      .max(100, { message: 'Widget name is too long' }),
  }),
  conditional: z.string().optional().nullable(),
})

export type Device = z.infer<typeof sourceSchema>['devices'][number]

export type dataTablePayload = z.infer<typeof dataTableSchema>

export const dataTableDefault: dataTablePayload = {
  widget_info: {
    name: 'New Data Table',
  },
  source: {
    devices: [],
  },
  columns: [],
  conditional: null,
}

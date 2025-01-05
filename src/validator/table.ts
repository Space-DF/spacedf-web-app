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
        .max(100, { message: 'Column name is too long' }),
      field: z.string(),
      type: z.enum(['General', 'Specific'], {
        required_error: 'Type is required',
      }),
    }),
  ),
  widget_info: z.object({
    name: z
      .string()
      .min(1, { message: 'enter_widget_name' })
      .max(100, { message: 'widget_name_too_long' }),
  }),
  conditional: z.string().optional().nullable(),
})

export type dataTablePayload = z.infer<typeof dataTableSchema>

export const columnTableDefault: dataTablePayload = {
  widget_info: {
    name: 'New Data Table',
  },
  source: {
    devices: [],
  },
  columns: [],
  conditional: null,
}

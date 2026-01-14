import { z } from 'zod'

export const sourceSchema = z.object({
  entities: z
    .array(
      z
        .object({
          entity_id: z.string().min(1, 'Entity ID is required'),
          entity_name: z.string().optional(),
        })
        .passthrough()
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
        .max(50, { message: 'Maximum 50 characters long!' }),
      field: z.string().min(1, { message: `Can't be empty!` }),
      type: z.enum(['General', 'Specific'], {
        required_error: 'Type is required',
      }),
      field_type: z.enum([
        'string',
        'number',
        'boolean',
        'unknown',
        'bigint',
        'symbol',
        'undefined',
        'object',
        'function',
      ]),
    })
  ),
  widget_info: z.object({
    name: z
      .string()
      .min(1, { message: 'Please enter widget name' })
      .max(100, { message: 'Maximum 100 characters long!' }),
  }),
  conditionals: z.array(
    z.object({
      field: z.string().min(1, { message: 'Please select field' }),
      operator: z.string().min(1, { message: 'Please select operator' }),
      value: z.string().min(1, { message: 'Please enter value' }),
      text_color: z.string().min(1, { message: 'Please select text color' }),
      bg_color: z
        .string()
        .min(1, { message: 'Please select background color' }),
      limit: z.boolean(),
    })
  ),
})

export type Device = z.infer<typeof sourceSchema>['entities'][number]
export type Column = z.infer<typeof dataTableSchema>['columns'][number]

export type dataTablePayload = z.infer<typeof dataTableSchema>

export const dataTableDefault: dataTablePayload = {
  widget_info: {
    name: 'New Data Table',
  },
  source: {
    entities: [],
  },
  columns: [],
  conditionals: [],
}

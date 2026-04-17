import { z } from 'zod'

export const switchSchema = z.object({
  enabled: z.boolean().default(true),
  source: z.object({
    entity_id: z.string().min(1, 'Device is required'),
  }),
  widget_info: z.object({
    name: z
      .string()
      .min(1, 'Widget name is required')
      .max(100, 'Maximum 100 characters long'),
  }),
})

export type SwitchPayload = z.infer<typeof switchSchema>

export const defaultSwitchValues: SwitchPayload = {
  enabled: true,
  source: {
    entity_id: '',
  },
  widget_info: {
    name: 'New switch widget',
  },
}

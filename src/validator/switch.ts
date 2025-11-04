import { z } from 'zod'

export const switchSchema = z.object({
  enabled: z.boolean().default(true),
  source: z.object({
    device_ids: z.array(z.string()).min(1, 'At least one device is required'),
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
    device_ids: [],
  },
  widget_info: {
    name: 'New switch widget',
  },
}

import { z } from 'zod'

export const addDeviceSchema = z.object({
  name: z.string({ message: 'This field cannot be empty' }),
  identifier: z.string({ message: 'This field cannot be empty' }),
  description: z
    .string()
    .max(500, { message: 'This field must not exceed 500 characters' })
    .optional(),
})

export type AddDeviceSchema = z.infer<typeof addDeviceSchema>

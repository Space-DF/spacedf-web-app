import { z } from 'zod'

export const addDeviceSchema = z.object({
  name: z.string({ message: 'This field cannot be empty' }),
  dev_eui: z
    .string({ message: 'This field cannot be empty' })
    .min(16, {
      message: 'Must be at least 16 characters long.',
    })
    .refine(
      (str) => {
        const numbers = str.split(' ')
        const twoDigitCount = numbers.filter((num) => num.length === 2).length
        return twoDigitCount === 8
      },
      {
        message: 'Dev EUI must be 8 bytes',
      }
    ),
  description: z
    .string()
    .max(500, { message: 'This field must not exceed 500 characters' })
    .optional(),
})

export type AddDeviceSchema = z.infer<typeof addDeviceSchema>

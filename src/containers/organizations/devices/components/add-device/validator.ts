import { z } from 'zod'

export const EUISchema = z.object({
  eui: z.array(
    z.object({
      id: z.string(),
      devEUI: z
        .string()
        .min(1, 'Dev EUI is required')
        .refine(
          (str) => {
            const numbers = str.split(' ')
            const twoDigitCount = numbers.filter(
              (num) => num.length === 2
            ).length
            return twoDigitCount === 8
          },
          {
            message: 'Dev EUI must be 8 bytes',
          }
        ),
      joinEUI: z
        .string()
        .min(1, 'Join EUI is required')
        .refine(
          (str) => {
            const numbers = str.split(' ')
            const twoDigitCount = numbers.filter(
              (num) => num.length === 2
            ).length
            return twoDigitCount === 8
          },
          {
            message: 'Dev EUI must be 8 bytes',
          }
        ),
      name: z.string().min(1, 'Name is required'),
      country: z.string({ required_error: 'Country is required' }),
      status: z.string(),
    })
  ),
})

export type EUIDevice = z.infer<typeof EUISchema>

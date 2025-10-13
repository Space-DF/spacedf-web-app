import { z } from 'zod'

export const spaceMemberSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
  created_at: z
    .string()
    .min(1, {
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
  created_by: z.string(),
  total_member: z.coerce.number(),
  description: z.string().optional(),
  logo: z.any().optional(),
})

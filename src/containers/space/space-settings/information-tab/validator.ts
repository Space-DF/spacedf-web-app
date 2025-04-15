import { z } from 'zod'

export const spaceMemberSchema = z.object({
  space_name: z
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
  owner: z.string(),
  space_member: z.string(),
  description: z.string().optional(),
})

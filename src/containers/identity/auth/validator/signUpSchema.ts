import {
  confirmPasswordSchema,
  firstNameSchema,
  passwordSchema,
  lastNameSchema,
} from '@/utils'
import { z } from 'zod'

export const singUpSchema = z
  .object({
    first_name: firstNameSchema,
    last_name: lastNameSchema,
    email: z
      .string({ message: 'Email cannot be empty' })
      .email({ message: 'Invalid Email' })
      .min(1, { message: 'Email cannot be empty' })
      .refine((value) => value.split('@')[0].length <= 64, {
        message: 'Invalid Email', // Local part max length
      })
      .refine((value) => value.split('@')[1]?.length <= 255, {
        message: 'Invalid Email', // Domain part max length
      }),
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Confirm password must match the password entered above.',
    path: ['confirm_password'],
  })

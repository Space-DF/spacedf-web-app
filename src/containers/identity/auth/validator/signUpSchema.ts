import {
  confirmPasswordSchema,
  firstNameSchema,
  passwordSchema,
  lastNameSchema,
} from '@/utils'
import { z } from 'zod'

export const signUpSchema = z
  .object({
    first_name: firstNameSchema,
    last_name: lastNameSchema,
    email: z
      .string({ message: 'Email cannot be empty' })
      .email({ message: 'Invalid email address' })
      .min(1, { message: 'Email cannot be empty' }),
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Confirm password must match the password entered above.',
    path: ['confirm_password'],
  })

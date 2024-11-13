import { z } from 'zod'

export function isJsonString(str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export const firstNameSchema = z
  .string({ message: 'First Name cannot be empty' })
  .max(50, {
    message: 'First Name must not exceed 50 characters',
  })
  .regex(/^[A-Za-z\s]*$/, {
    message: 'Only alphabetic characters and spaces are accepted',
  })

export const lastNameSchema = z
  .string({ message: 'Last Name cannot be empty' })
  .max(50, {
    message: 'Last Name must not exceed 50 characters',
  })
  .regex(/^[A-Za-z\s]*$/, {
    message: 'Only alphabetic characters and spaces are accepted',
  })

export const currentPasswordSchema = z
  .string({ message: 'This field cannot be empty.' })
  .min(8, { message: 'Must be at least 8 characters long.' })
  .max(150, {
    message: 'Password must be less than or equal to 150 characters',
  })
  .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/, {
    message:
      'Should include at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
export const newPasswordSchema = z
  .string({ message: 'New Password cannot be empty ' })
  .min(8, { message: 'Must be at least 8 characters long.' })
  .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/, {
    message:
      'The password must has least 8 character, including uppercase letters, numbers, and special characters.',
  })

export const passwordSchema = z
  .string({ message: 'Password cannot be empty' })
  .min(8, { message: 'Must be at least 8 characters long.' })
  .max(150, {
    message: 'Password must be less than or equal to 150 characters',
  })
  .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/, {
    message:
      'The password must has least 8 character, including uppercase letters, numbers, and special characters.',
  })

export const confirmPasswordSchema = z
  .string({ message: 'Confirm password cannot be empty' })
  .min(8, { message: 'Must be at least 8 characters long.' })

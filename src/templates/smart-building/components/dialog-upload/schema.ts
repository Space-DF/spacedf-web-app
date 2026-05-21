import { z } from 'zod'

export const dialogUploadSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).trim(),
})

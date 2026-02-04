import { z } from 'zod'

export const dashboardSchema = z.object({
  name: z.string().min(1, 'Dashboard name is required'),
})

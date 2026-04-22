import { z } from 'zod'

export const buildingSchema = z.object({
  name: z.string().min(1, 'Building name is required').trim(),
})
export type BuildingFormValues = z.infer<typeof buildingSchema>

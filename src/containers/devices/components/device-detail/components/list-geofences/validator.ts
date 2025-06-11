import { z } from 'zod'

export const addGeofenceSchema = z.object({
  shape: z.enum(['circle', 'square', 'custom']),
  name: z.string().min(1, { message: 'Name is required' }),
  tag: z.string().optional(),
  radius: z.number().min(1, { message: 'Radius is required' }),
  latitude: z
    .number()
    .min(-90, { message: 'Latitude must be between -90 and 90' })
    .max(90, { message: 'Latitude must be between -90 and 90' }),
  longitude: z
    .number()
    .min(-180, { message: 'Longitude must be between -180 and 180' })
    .max(180, { message: 'Longitude must be between -180 and 180' }),
  unit: z.enum(['km', 'mi']),
})

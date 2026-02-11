import { z } from 'zod'

export const timeConditionSchema = z.object({
  type: z.literal('time'),
  before: z.string({ required_error: 'Before is required' }),
  before_type: z.enum(['am', 'pm']),
  after: z.string({ required_error: 'After is required' }),
  after_type: z.enum(['am', 'pm']),
  weekdays: z.array(
    z.enum([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ])
  ),
})

export const distanceThresholdConditionSchema = z.object({
  type: z.literal('distance_threshold'),
  threshold: z.coerce
    .number({
      required_error: 'Threshold is required',
      invalid_type_error: 'Threshold must be a number',
    })
    .positive({ message: 'Threshold must be greater than 0' }),
  unit: z.enum(['km', 'm']),
})

const ruleSchema: z.ZodTypeAny = z.lazy(() =>
  z.discriminatedUnion('type', [
    timeConditionSchema,
    distanceThresholdConditionSchema,
    z.object({
      type: z.literal('and'),
      rules: z.array(ruleSchema).min(1),
    }),
    z.object({
      type: z.literal('or'),
      rules: z.array(ruleSchema).min(1),
    }),
    z.object({
      type: z.literal('not'),
      rule: ruleSchema,
    }),
  ])
)

export const addGeofenceSchema = z.object({
  type: z.enum(['safe', 'danger']),
  color: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  conditions: z.array(ruleSchema).min(1),
})

export type GeofenceForm = z.infer<typeof addGeofenceSchema>

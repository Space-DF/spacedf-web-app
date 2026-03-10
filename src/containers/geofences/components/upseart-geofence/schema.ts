import { z } from 'zod'

export const timeConditionSchema = z.object({
  type: z.literal('time'),
  before: z
    .string({ required_error: 'Before time is required' })
    .min(1, { message: 'Before time is required' }),
  before_type: z.enum(['am', 'pm']),
  after: z
    .string({ required_error: 'After time is required' })
    .min(1, { message: 'After time is required' }),
  after_type: z.enum(['am', 'pm']),
  weekdays: z.array(z.number().int().min(0).max(6)),
})

const THRESHOLD_MAX = 100_000

export const distanceThresholdConditionSchema = z.object({
  type: z.literal('distance_threshold'),
  threshold: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce
      .number({ invalid_type_error: 'Threshold must be a number' })
      .refine((n) => !Number.isNaN(n), { message: 'Threshold is required' })
      .refine((n) => n > 0, { message: 'Threshold must be greater than 0' })
      .refine((n) => n <= THRESHOLD_MAX, {
        message: `Threshold must be ${THRESHOLD_MAX.toLocaleString()} or less`,
      })
  ),
  unit: z.enum(['km', 'm']),
})

export const ruleSchema: z.ZodTypeAny = z.lazy(() =>
  z.discriminatedUnion('type', [
    timeConditionSchema,
    distanceThresholdConditionSchema,
    z.object({
      type: z.literal('and'),
      rules: z.array(ruleSchema),
    }),
    z.object({
      type: z.literal('or'),
      rules: z.array(ruleSchema),
    }),
    z.object({
      type: z.literal('not'),
      rules: z.array(ruleSchema),
    }),
  ])
)

export const addGeofenceSchema = z.object({
  type_zone: z.enum(['safe', 'danger']),
  color: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  conditions: z.array(ruleSchema).min(1),
})

export type GeofenceForm = z.infer<typeof addGeofenceSchema>

export type ConditionType = GeofenceForm['conditions'][number]['type']

export const DEFAULT_CONDITIONS: Record<
  Extract<ConditionType, 'time' | 'distance_threshold'>,
  Extract<
    GeofenceForm['conditions'][number],
    { type: 'time' } | { type: 'distance_threshold' }
  >
> = {
  time: {
    type: 'time',
    before: '12:00',
    before_type: 'pm',
    after: '12:00',
    after_type: 'am',
    weekdays: [],
  },
  distance_threshold: {
    type: 'distance_threshold',
    threshold: 1,
    unit: 'km',
  },
}

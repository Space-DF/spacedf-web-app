import { z } from 'zod'

export const GROUP_TYPES = ['and', 'or', 'not', 'leaf'] as const
export type GroupType = (typeof GROUP_TYPES)[number]

export const CONDITION_OPERATORS = [
  'gte',
  'lte',
  'eq',
  'neq',
  'gt',
  'lt',
] as const

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number]

export type AutomationCondition =
  | {
      type: 'leaf'
      entity: string
      operator: ConditionOperator
      value: string
    }
  | {
      type: Exclude<GroupType, 'leaf'>
      rules: AutomationCondition[]
    }
const conditionOperatorSchema = z.enum(CONDITION_OPERATORS)

const leafSchema = z.object({
  type: z.literal('leaf'),
  entity: z.string().min(1, { message: 'Please select entity' }),
  operator: conditionOperatorSchema,
  value: z.preprocess(
    (v) => {
      if (typeof v !== 'string') return v
      const trimmed = v.trim()
      return trimmed === '' ? undefined : trimmed
    },
    z.coerce
      .number({ invalid_type_error: 'Value must be a number.' })
      .refine((n) => !Number.isNaN(n), { message: 'Value must be a number.' })
      .transform((n) => String(n))
  ),
})

export const ruleSchema: z.ZodTypeAny = z.lazy(() =>
  z.discriminatedUnion('type', [
    leafSchema,
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

// const actionTypeSchema = z.string().min(1, { message: 'Please select action' })
// const actionSchema = z.object({
//   id: z.string(),
//   type: actionTypeSchema,
// })

export const addAutomationFormSchema = z.object({
  name: z.string().min(1, { message: 'Please enter name' }),
  title: z
    .string({ required_error: 'Please enter title' })
    .min(1, { message: 'Please enter title' })
    .max(100, { message: 'Title must not exceed 100 characters' }),
  device_id: z.string().min(1, { message: 'Please select device' }),
  conditions: z.array(ruleSchema),
  // actions: z.array(actionSchema),
})

export type AddAutomationFormValues = z.infer<typeof addAutomationFormSchema>

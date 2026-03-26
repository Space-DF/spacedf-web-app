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

const actionTypeSchema = z.string()
const actionSchema = z.object({
  id: z.string(),
  type: actionTypeSchema,
})

export const addAutomationFormSchema = z
  .object({
    name: z.string().min(1, { message: 'Please enter name' }),
    device_id: z.string().min(1, { message: 'Please select device' }),
    conditions: z.array(ruleSchema).min(1),
    actions: z.array(actionSchema).min(1, { message: 'Please select actions' }),
  })
  .superRefine((values, ctx) => {
    const selectedActionCount = values.actions.filter(
      (a) => a.type && a.type.trim().length > 0
    ).length
    if (selectedActionCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actions'],
        message: 'Please select actions',
      })
    }
  })

export type AddAutomationFormValues = z.infer<typeof addAutomationFormSchema>

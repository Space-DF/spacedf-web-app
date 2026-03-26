import { ZodError } from 'zod'
import YAML from 'yaml'
import {
  AutomationCondition,
  ConditionOperator,
  ruleSchema,
} from '../../../../schema'

type YamlLeaf = {
  type: 'leaf'
  entity: string
  operator: ConditionOperator
  value: string
}
type YamlCondition = YamlLeaf | YamlGroup
type YamlGroup = { type: 'and' | 'or' | 'not'; rules: YamlCondition[] }

function formatZodErrors(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
      return `${path}${issue.message}`
    })
    .join('\n')
}

function injectIds(condition: YamlCondition): AutomationCondition {
  if (condition.type === 'leaf') {
    return { ...condition }
  }
  return {
    ...condition,
    rules: condition.rules.map(injectIds),
  }
}

export function stripInternalFields(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripInternalFields)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => key !== 'id')
        .map(([key, val]) => [key, stripInternalFields(val)])
    )
  }
  return obj
}

export function parseAndValidateYaml(
  yamlStr: string,
  fallbackError: string
):
  | { success: true; data: AutomationCondition & { kind: 'group' } }
  | { success: false; error: string } {
  try {
    const raw = YAML.parse(yamlStr)
    if (!raw || typeof raw !== 'object') {
      return { success: false, error: fallbackError }
    }
    const result = ruleSchema.safeParse(raw)
    if (!result.success) {
      return { success: false, error: formatZodErrors(result.error) }
    }
    if (result.data.type === 'leaf') {
      return {
        success: false,
        error: 'Root must be a group condition (and/or/not)',
      }
    }
    return {
      success: true,
      data: injectIds(result.data) as AutomationCondition & { kind: 'group' },
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : fallbackError,
    }
  }
}

import { AutomationRuleCondition } from '@/types/automation'
import { AutomationCondition, ConditionOperator } from './schema'

export function normalize(c: AutomationCondition): any {
  if (c.type === 'leaf') {
    return { [c.entity]: { [c.operator]: Number(c.value) } }
  }
  return { [c.type]: c.rules.map(normalize) }
}

export const buildConditionPayload = (c: AutomationCondition) => normalize(c)

export function mapBackendRuleToFormCondition(
  c: AutomationRuleCondition
): AutomationCondition {
  if (c && typeof c === 'object' && !Array.isArray(c)) {
    if ('and' in c && Array.isArray(c.and)) {
      return {
        type: 'and',
        rules: (c.and as AutomationRuleCondition[]).map(
          mapBackendRuleToFormCondition
        ),
      }
    }

    if ('or' in c && Array.isArray(c.or)) {
      return {
        type: 'or',
        rules: (c.or as AutomationRuleCondition[]).map(
          mapBackendRuleToFormCondition
        ),
      }
    }

    if ('not' in c && Array.isArray(c.not)) {
      return {
        type: 'not',
        rules: (c.not as AutomationRuleCondition[]).map(
          mapBackendRuleToFormCondition
        ),
      }
    }
  }

  const leaf = c as Record<string, Record<string, number> | unknown>
  const entity = Object.keys(leaf)[0] ?? ''
  const operatorMap = entity
    ? ((leaf[entity] as Record<string, number> | undefined) ?? {})
    : {}
  const operatorKey = Object.keys(operatorMap)[0] as
    | ConditionOperator
    | undefined
  const value = operatorKey ? operatorMap[operatorKey] : 0

  return {
    type: 'leaf',
    entity,
    operator: (operatorKey ?? 'lte') as ConditionOperator,
    value: String(value),
  }
}

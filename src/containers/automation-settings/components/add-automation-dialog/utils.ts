import { AutomationRuleCondition } from '@/types/automation'
import { AutomationCondition, ConditionOperator } from './schema'

export const buildConditionPayload = (
  c: AutomationCondition
): AutomationRuleCondition => {
  if (c.type === 'leaf') {
    return { [c.entity]: { [c.operator]: Number(c.value) } }
  }
  const rules = c.rules.map(buildConditionPayload)
  return { type: c.type, rules } as AutomationRuleCondition
}

export function mapBackendRuleToFormCondition(
  c: AutomationRuleCondition
): AutomationCondition {
  if (
    c &&
    typeof c === 'object' &&
    !Array.isArray(c) &&
    Array.isArray((c as { rules?: unknown }).rules) &&
    ((c as { type?: unknown }).type === 'and' ||
      (c as { type?: unknown }).type === 'or' ||
      (c as { type?: unknown }).type === 'not')
  ) {
    const groupType = (
      c as { type: 'and' | 'or' | 'not'; rules: AutomationRuleCondition[] }
    ).type
    const rules = (c as { rules: AutomationRuleCondition[] }).rules
    return { type: groupType, rules: rules.map(mapBackendRuleToFormCondition) }
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

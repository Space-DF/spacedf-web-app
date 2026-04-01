export type AutomationStatus = 'active' | 'disabled'

export type AutomationRuleConditionLeaf = {
  [entity: string]: Record<string, number>
}

export type AutomationRuleCondition =
  | { and: AutomationRuleCondition[] }
  | { or: AutomationRuleCondition[] }
  | { not: AutomationRuleCondition[] }
  | AutomationRuleConditionLeaf

export interface AutomationEventRule {
  rule_key: string
  definition: {
    conditions: {
      and: AutomationRuleCondition[]
    }
  }
  is_active?: boolean
  repeat_able?: boolean
  cooldown_sec?: number
  description?: string
}

export interface AutomationAction {
  id: string
  key: string
  name: string
  data: Record<string, unknown>
  created_at: string
}

export interface Automation {
  id: string
  name: string
  title: string
  device_id: string
  actions: AutomationAction[]
  event_rule?: AutomationEventRule
  created_at: string
  updated_at: string
}

export interface AutomationParams {
  name: string
  title: string
  device_id: string
  action_ids: string[]
  event_rule: AutomationEventRule
}

export type AutomationStatus = 'active' | 'disabled'

export interface Automation {
  id: string
  name: string
  triggers: string[]
  targetDevice: string
  assignedAction: string[]
  status: AutomationStatus
  lastTriggered: string
  lastUpdated: string
}

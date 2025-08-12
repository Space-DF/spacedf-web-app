export type TemplateId =
  | 'fleet-tracking'
  | 'warehouse-tracking'
  | 'smart-office'
  | 'indoor-tracking'
  | 'water-management'

export interface TemplateConfig {
  id: TemplateId
  name: string
  description: string
  implemented: boolean
  route: string
  thumbnail?: string
}

export interface TemplateStore {
  currentTemplate: TemplateId | null
  availableTemplates: TemplateConfig[]

  // Actions
  setCurrentTemplate: (templateId: TemplateId) => void
  getTemplate: (templateId: TemplateId) => TemplateConfig | undefined
  getImplementedTemplates: () => TemplateConfig[]
}

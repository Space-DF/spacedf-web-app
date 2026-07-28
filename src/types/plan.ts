export type PlanCode = 'free' | 'pro'
export type BillingCycle = 'monthly' | 'yearly'

export type PlanItem = {
  id: string
  price: string
  icon: string
  currency: string
  discount: number
  billing_cycle: BillingCycle
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Feature = {
  id: string
  code: string
  name: string
  description: string
}

export type PlanFeature = {
  id: string
  feature: Feature
  enabled: boolean
  limit_value: number | null
  metadata: Record<string, unknown>
}

export type PlanResponse = {
  id: string
  name: string
  code: PlanCode
  description: string
  plan_items: PlanItem[]
  is_current_plan: boolean
  created_at: string
  updated_at: string
  features: PlanFeature[]
  support: PlanFeature[]
}

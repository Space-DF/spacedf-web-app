/** Free-tier ceilings enforced in the dashboard and add-device flows. */
export const MAX_DASHBOARD_FREE_LIMIT = 1
export const MAX_LIMIT_DEVICES = 10

/**
 * Pricing and renewal are not exposed by any API yet, so they are pinned here.
 * Replace with the billing endpoint before this reaches paying customers.
 */
export const PRO_PLAN_PRICE_USD = 89
export const PRO_PLAN_RENEWS_AT = '2027-06-25'

export type PlanFeature = {
  key: string
  values?: Record<string, number>
}

export type Plan = {
  nameKey: string
  price?: number
  renewsAt?: string
  features: PlanFeature[]
  support: PlanFeature[]
}

export const PRO_PLAN: Plan = {
  nameKey: 'pro_plan',
  price: PRO_PLAN_PRICE_USD,
  renewsAt: PRO_PLAN_RENEWS_AT,
  features: [
    { key: 'plan_multiple_organizations' },
    { key: 'plan_100_spaces' },
    { key: 'plan_fully_management_device' },
    { key: 'plan_custom_dashboard' },
    { key: 'plan_white_labeling' },
  ],
  support: [
    { key: 'plan_onboarding_video' },
    { key: 'plan_email_community_support' },
    { key: 'plan_priority_support' },
    { key: 'plan_fully_maintenance' },
  ],
}

export const FREE_PLAN: Plan = {
  nameKey: 'free_plan',
  price: 0,
  features: [
    { key: 'plan_free_organization' },
    { key: 'plan_free_space' },
    { key: 'plan_free_basic_device_management' },
    {
      key: 'plan_free_dashboards',
      values: { count: MAX_DASHBOARD_FREE_LIMIT },
    },
  ],
  support: [
    { key: 'plan_onboarding_video' },
    { key: 'plan_email_community_support' },
  ],
}

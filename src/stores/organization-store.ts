import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type OrganizationState = {
  step: 'create' | 'template'
  organizationName: string
  organizationSlug: string
  organizationTemplate: string
}

type OrganizationAction = {
  setStep: (step: OrganizationState['step']) => void
  setOrganizationInfo: (
    values: Partial<
      Pick<
        OrganizationState,
        'organizationName' | 'organizationSlug' | 'organizationTemplate'
      >
    >
  ) => void
  resetOrganizationInfo: () => void
}

const defaultState: OrganizationState = {
  step: 'create',
  organizationName: '',
  organizationSlug: '',
  organizationTemplate: 'smart_fleet_monitor',
}

export const organization = create<OrganizationState & OrganizationAction>(
  (set, get) => ({
    ...defaultState,
    setStep: (step) => set(() => ({ step })),
    setOrganizationInfo: (values) => {
      const { organizationName, organizationSlug, organizationTemplate } = get()
      set(() => ({
        organizationName: values.organizationName || organizationName,
        organizationSlug: values.organizationSlug || organizationSlug,
        organizationTemplate:
          values.organizationTemplate || organizationTemplate,
      }))
    },
    resetOrganizationInfo: () => set(() => defaultState),
  })
)

export const useOrganizationStore = () => {
  return organization(useShallow((state) => state))
}

import { Template } from '@/types/template'
import { create } from 'zustand'
import { OrganizationSetting } from '@/types/organization'

export type OrganizationValidationSnapshot = {
  isValid: boolean
  template: string
  isSmartBuilding?: boolean
  setting?: OrganizationSetting
}

type OrganizationValidationStore = OrganizationValidationSnapshot & {
  /** False until the org layout hydrates from the server `checkSlugName` result. */
  hasHydrated: boolean
  setOrganizationValidation: (value: OrganizationValidationSnapshot) => void
  resetOrganizationValidation: () => void
}

const initial: OrganizationValidationSnapshot & { hasHydrated: boolean } = {
  isValid: false,
  template: '',
  hasHydrated: false,
  isSmartBuilding: false,
  setting: undefined,
}

export const useOrganizationValidationStore =
  create<OrganizationValidationStore>((set) => ({
    ...initial,
    setOrganizationValidation: (value) =>
      set({
        ...value,
        hasHydrated: true,
        isSmartBuilding: value.template === Template.SMART_BUILDING,
      }),
    resetOrganizationValidation: () => set(initial),
  }))

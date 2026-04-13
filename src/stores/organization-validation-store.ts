import { create } from 'zustand'

export type OrganizationValidationSnapshot = {
  isValid: boolean
  template: string
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
}

export const useOrganizationValidationStore =
  create<OrganizationValidationStore>((set) => ({
    ...initial,
    setOrganizationValidation: (value) => set({ ...value, hasHydrated: true }),
    resetOrganizationValidation: () => set(initial),
  }))

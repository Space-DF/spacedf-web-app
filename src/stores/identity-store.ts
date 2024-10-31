import { create } from 'zustand'

type IdentityState = {
  openDrawerIdentity: boolean
  organizationName: string
  organizationDomain: string
}

type IdentityAction = {
  setOpenDrawerIdentity: (newState: boolean) => void
  setOrganizationName: (organizationName: string) => void
  setOrganizationDomain: (organization: string) => void
}

export const useIdentityStore = create<IdentityState & IdentityAction>(
  (set) => ({
    openDrawerIdentity: false,
    organizationName: '',
    organizationDomain: '',
    setOrganizationName: (organizationName) =>
      set(() => ({
        organizationName,
      })),
    setOpenDrawerIdentity: (newState) =>
      set(() => ({
        openDrawerIdentity: newState,
      })),
    setOrganizationDomain: (domain) =>
      set(() => ({
        organizationDomain: domain,
      })),
  }),
)

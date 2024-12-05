import { create } from 'zustand'

type IdentityState = {
  openDrawerIdentity: boolean
  organizationName: string
  organizationDomain: string
  openGuideline: boolean
}

type IdentityAction = {
  setOpenDrawerIdentity: (newState: boolean) => void
  setOrganizationName: (organizationName: string) => void
  setOrganizationDomain: (organization: string) => void
  setOpenGuideline: (open: boolean) => void
}

export const useIdentityStore = create<IdentityState & IdentityAction>(
  (set) => ({
    openGuideline: false,
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
    setOpenGuideline: (open) => {
      set(() => ({ openGuideline: open }))
    },
  }),
)

import { create } from 'zustand'

type IdentityState = {
  openDrawerIdentity: boolean
  organizationName: string
  organizationDomain: string
  openGuideline: boolean
  rootAuth: ['sign-up' | 'verify-code', string]
}

type IdentityAction = {
  setOpenDrawerIdentity: (newState: boolean) => void
  setOrganizationName: (organizationName: string) => void
  setOrganizationDomain: (organization: string) => void
  setOpenGuideline: (open: boolean) => void
  setRootAuth: (state: IdentityState['rootAuth']) => void
}

export const useIdentityStore = create<IdentityState & IdentityAction>(
  (set) => ({
    openGuideline: false,
    openDrawerIdentity: false,
    organizationName: '',
    organizationDomain: '',
    rootAuth: ['sign-up', ''],
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
    setRootAuth: (state) => {
      set(() => ({ rootAuth: state }))
    },
  }),
)

import { create } from "zustand"

type IdentityState = {
  openDrawerIdentity: boolean
  organizationName: string
}

type IdentityAction = {
  setOpenDrawerIdentity: (newState: boolean) => void
  setOrganizationName: (organizationName: string) => void
}

export const useIdentityStore = create<IdentityState & IdentityAction>(
  (set) => ({
    openDrawerIdentity: false,
    organizationName: "",
    setOrganizationName: (organizationName) =>
      set(() => ({
        organizationName,
      })),
    setOpenDrawerIdentity: (newState) =>
      set(() => ({
        openDrawerIdentity: newState,
      })),
  })
)

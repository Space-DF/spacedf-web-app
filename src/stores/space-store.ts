import { create } from 'zustand'
type IdentityState = {
  shouldBackPreviousPage: boolean
  isLoading: boolean
}

type IdentityAction = {
  setBackPreviousPage: (newState: boolean) => void
  setLoading: () => void
}

export const useSpaceStore = create<IdentityState & IdentityAction>((set) => ({
  shouldBackPreviousPage: false,
  isLoading: false,
  setBackPreviousPage: (newState) =>
    set(() => ({ shouldBackPreviousPage: newState })),
  setLoading: () => {
    set(() => ({ isLoading: true }))
    setTimeout(() => {
      set(() => ({ isLoading: false }))
    }, 1000)
  },
}))

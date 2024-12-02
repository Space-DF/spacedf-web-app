import { create } from 'zustand'
type IdentityState = {
  isViewAllDashboard: boolean
  deleteId?: string | number
}

type IdentityAction = {
  setViewAllDashboard: (open: boolean) => void
  setDeleteId: (id?: string | number) => void
}

export const useDashboardStore = create<IdentityState & IdentityAction>(
  (set) => ({
    isViewAllDashboard: false,
    deleteId: undefined,
    setDeleteId: (id) => set(() => ({ deleteId: id })),
    setViewAllDashboard: (open) => set(() => ({ isViewAllDashboard: open })),
  }),
)

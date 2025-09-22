import { create } from 'zustand'
type IdentityState = {
  isViewAllDashboard: boolean
  isEdit: boolean
  deleteId?: string
}

type IdentityAction = {
  setViewAllDashboard: (open: boolean) => void
  setEdit: (edit?: boolean) => void
  setDeleteId: (id?: string) => void
}

export const useDashboardStore = create<IdentityState & IdentityAction>(
  (set) => ({
    isViewAllDashboard: false,
    deleteId: undefined,
    isEdit: false,
    setDeleteId: (id) => set(() => ({ deleteId: id })),
    setViewAllDashboard: (open) => set(() => ({ isViewAllDashboard: open })),
    setEdit: (edit) => set(() => ({ isEdit: edit })),
  })
)

import { create } from 'zustand'
type IdentityState = {
  isViewAllDashboard: boolean
  isEdit: boolean
  deleteId?: string
  dashboardId?: string
  widgets: any[]
}

type IdentityAction = {
  setViewAllDashboard: (open: boolean) => void
  setEdit: (edit?: boolean) => void
  setDeleteId: (id?: string) => void
  setDashboardId: (id?: string) => void
  setWidgets: (widgets: any[]) => void
}

export const useDashboardStore = create<IdentityState & IdentityAction>(
  (set) => ({
    isViewAllDashboard: false,
    deleteId: undefined,
    isEdit: false,
    dashboardId: undefined,
    widgets: [],
    setDeleteId: (id) => set(() => ({ deleteId: id })),
    setViewAllDashboard: (open) => set(() => ({ isViewAllDashboard: open })),
    setEdit: (edit) => set(() => ({ isEdit: edit })),
    setDashboardId: (id) => set(() => ({ dashboardId: id })),
    setWidgets: (widgets) => set(() => ({ widgets })),
  })
)

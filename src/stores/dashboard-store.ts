import { Dashboard } from '@/types/dashboard'
import { create } from 'zustand'
type IdentityState = {
  isViewAllDashboard: boolean
  isEdit: boolean
  deleteId?: string
  dashboard?: Dashboard
  widgetList: any[]
}

type IdentityAction = {
  setViewAllDashboard: (open: boolean) => void
  setEdit: (edit?: boolean) => void
  setDeleteId: (id?: string) => void
  setDashboard: (dashboard?: Dashboard) => void
  setWidgetList: (widgetList: any) => void
}

export const useDashboardStore = create<IdentityState & IdentityAction>(
  (set) => ({
    isViewAllDashboard: false,
    deleteId: undefined,
    isEdit: false,
    dashboard: undefined,
    widgetList: [],
    setWidgetList: (widgetList) => set(() => ({ widgetList })),
    setDeleteId: (id) => set(() => ({ deleteId: id })),
    setViewAllDashboard: (open) => set(() => ({ isViewAllDashboard: open })),
    setEdit: (edit) => set(() => ({ isEdit: edit })),
    setDashboard: (dashboard) => set(() => ({ dashboard })),
  })
)

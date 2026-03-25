import { create } from 'zustand'
import { AutomationCondition } from '../../../schema'

interface AutomationStore {
  currentCondition: undefined | AutomationCondition
  setCurrentCondition: (condition?: AutomationCondition) => void
}

export const useAutomationStore = create<AutomationStore>((set) => ({
  currentCondition: undefined,
  setCurrentCondition: (condition) => set({ currentCondition: condition }),
}))

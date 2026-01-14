import { create } from 'zustand'

type GeneralSettingState = {
  isOpen: boolean
  currentSetting: string
}

type GeneralSettingActions = {
  setIsOpen: (isOpen: boolean) => void
  setCurrentSetting: (setting: string) => void
  openDialog: () => void
  closeDialog: () => void
}

export const useGeneralSetting = create<
  GeneralSettingState & GeneralSettingActions
>((set) => ({
  isOpen: false,
  currentSetting: 'appearance',
  setIsOpen: (isOpen) => set({ isOpen }),
  setCurrentSetting: (setting) => set({ currentSetting: setting }),
  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
}))

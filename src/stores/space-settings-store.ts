import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type SpaceSettingsState = {
  step: 'delete' | 'information'
  shouldBackToHome: boolean
  isOpenAlertDialog: boolean
}

type SpaceSettingsAction = {
  setStep: (step: SpaceSettingsState['step']) => void
  setShouldBackToHome: (state: boolean) => void
  setOpenAlertDialog: (state: boolean) => void
}

export const spaceSettings = create<SpaceSettingsState & SpaceSettingsAction>(
  (set) => ({
    step: 'information',
    shouldBackToHome: false,
    isOpenAlertDialog: false,
    setStep: (step) => set(() => ({ step })),
    setShouldBackToHome: (newState) =>
      set(() => ({ shouldBackToHome: newState })),
    setOpenAlertDialog: (newState) =>
      set(() => ({ isOpenAlertDialog: newState })),
  })
)

export const useSpaceSettings = () => {
  return spaceSettings(useShallow((state) => state))
}

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type SpaceSettingsState = {
  step: 'delete' | 'information'
}

type SpaceSettingsAction = {
  setStep: (step: SpaceSettingsState['step']) => void
}

export const spaceSettings = create<SpaceSettingsState & SpaceSettingsAction>(
  (set) => ({
    step: 'information',
    setStep: (step) => set(() => ({ step })),
  }),
)

export const useSpaceSettings = () => {
  return spaceSettings(useShallow((state) => state))
}

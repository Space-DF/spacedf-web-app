import { create } from 'zustand'

interface MoveDeviceStore {
  deviceId: string | null
  isDragging: boolean
  setDeviceId: (id: string | null) => void
  setIsDragging: (isDragging: boolean) => void
  setPosition: (position?: { x: number; y: number; z: number }) => void
  movedPositions: Record<string, { x: number; y: number; z: number }>
  reset: () => void
  isEditMode: boolean
  setIsEditMode: (isEditMode: boolean) => void
}

export const useMoveDeviceStore = create<MoveDeviceStore>((set) => ({
  deviceId: null,
  isDragging: false,
  movedPositions: {},
  isEditMode: false,
  setDeviceId: (deviceId) => set({ deviceId }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setPosition: (position) =>
    set((state) => {
      if (state.deviceId && position) {
        return {
          movedPositions: {
            ...state.movedPositions,
            [state.deviceId]: position,
          },
        }
      }
      return {}
    }),
  setIsEditMode: (isEditMode) => set({ isEditMode }),
  reset: () =>
    set({
      deviceId: null,
      isDragging: false,
      movedPositions: {},
    }),
}))

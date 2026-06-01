import { create } from 'zustand'

interface MoveDeviceStore {
  deviceId: string | null
  isDragging: boolean
  setDeviceId: (id: string | null) => void
  setIsDragging: (isDragging: boolean) => void
  position?: { x: number; y: number; z: number }
  setPosition: (position?: { x: number; y: number; z: number }) => void
  reset: () => void
}

export const useMoveDeviceStore = create<MoveDeviceStore>((set) => ({
  deviceId: null,
  isDragging: false,
  position: undefined,
  setDeviceId: (deviceId) => set({ deviceId }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setPosition: (position) => set({ position }),
  reset: () => set({ deviceId: null, isDragging: false, position: undefined }),
}))

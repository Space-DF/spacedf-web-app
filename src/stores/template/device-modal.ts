import { create } from 'zustand'

interface DeviceModalStore {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  position?: {
    x: number
    y: number
    z: number
  }
  setPosition: (position?: { x: number; y: number; z: number }) => void
  reset: () => void
}

export const useDeviceModalStore = create<DeviceModalStore>((set) => ({
  isOpen: false,
  position: undefined,
  setIsOpen: (isOpen) => set({ isOpen }),
  setPosition: (position) => set({ position }),
  reset: () => set({ isOpen: false, position: undefined }),
}))

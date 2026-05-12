import { Building } from '@/types/building'
import { create } from 'zustand'

interface AddDeviceStore {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  position?: {
    x: number
    y: number
    z: number
  }
  setPosition: (position?: { x: number; y: number; z: number }) => void
  reset: () => void
  building?: Building
  setBuilding: (building?: Building) => void
}

export const useAddDeviceStore = create<AddDeviceStore>((set) => ({
  isOpen: false,
  position: undefined,
  setIsOpen: (isOpen) => set({ isOpen }),
  setPosition: (position) => set({ position }),
  reset: () => set({ isOpen: false, position: undefined, building: undefined }),
  building: undefined,
  setBuilding: (building) => set({ building }),
}))

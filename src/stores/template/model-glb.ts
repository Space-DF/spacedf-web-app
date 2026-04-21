import { getS3Url } from '@/utils'
import { create } from 'zustand'

interface ModelGLBState {
  modelGLB?: string
  setModelGLB: (modelGLB?: string) => void
  modelGLBUrl?: string
  setModelGLBUrl: (modelGLBUrl?: string) => void
  setDefaultModel: () => void
  resetModel: () => void
}

export const useModelGLB = create<ModelGLBState>()((set) => ({
  modelGLB: undefined,
  modelGLBUrl: undefined,
  setModelGLB: (modelGLB) => set({ modelGLB }),
  setModelGLBUrl: (modelGLBUrl) => set({ modelGLBUrl }),
  setDefaultModel: () =>
    set({
      modelGLB: 'building.glb',
      modelGLBUrl: getS3Url('glbs/spacedf/building.glb'),
    }),
  resetModel: () => set({ modelGLB: undefined, modelGLBUrl: undefined }),
}))

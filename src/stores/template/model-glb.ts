import { create } from 'zustand'

interface ModelGLBState {
  modelGLB?: string
  setModelGLB: (modelGLB?: string) => void
  modelGLBUrl?: string
  setModelGLBUrl: (modelGLBUrl?: string) => void
  setDefaultModel: () => void
  resetModel: () => void
  uploadPickerOpener?: () => void
  registerUploadPickerOpener: (opener?: () => void) => void
  openUploadPicker: () => void
}

export const useModelGLB = create<ModelGLBState>()((set, get) => ({
  modelGLB: undefined,
  modelGLBUrl: undefined,
  setModelGLB: (modelGLB) => set({ modelGLB }),
  setModelGLBUrl: (modelGLBUrl) => set({ modelGLBUrl }),
  setDefaultModel: () =>
    set({
      modelGLB: 'building.glb',
      modelGLBUrl:
        'https://d33et8skld5wvq.cloudfront.net/glbs/spacedf/building.glb',
    }),
  resetModel: () => set({ modelGLB: undefined, modelGLBUrl: undefined }),
  uploadPickerOpener: undefined,

  registerUploadPickerOpener: (opener) => set({ uploadPickerOpener: opener }),
  openUploadPicker: () => {
    get().uploadPickerOpener?.()
  },
}))

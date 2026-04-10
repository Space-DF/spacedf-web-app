import { create } from 'zustand'
import type { Camera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

type DollyDirection = 'in' | 'out'

type ThreeModelControllerState = {
  controls?: OrbitControlsImpl
  camera?: Camera
  autoRotate: boolean
  setControls: (controls?: OrbitControlsImpl) => void
  setCamera: (camera?: Camera) => void
  setAutoRotate: (next: boolean) => void
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
}

let activeZoomRaf: number | null = null

function cancelActiveZoom() {
  if (activeZoomRaf == null) return
  cancelAnimationFrame(activeZoomRaf)
  activeZoomRaf = null
}

function smoothDolly(
  controls: OrbitControlsImpl,
  direction: DollyDirection,
  factor: number
) {
  cancelActiveZoom()

  const durationMs = 220
  const start = performance.now()

  const tick = () => {
    const now = performance.now()
    const t = Math.min(1, (now - start) / durationMs)

    const eased = 1 - Math.pow(1 - t, 3)

    const prevEased = 1 - Math.pow(1 - (t - 1 / 60), 3)
    const delta = Math.max(0, eased - Math.max(0, prevEased))
    const stepFactor = Math.pow(factor, delta)

    if (direction === 'in') controls.dollyIn(stepFactor)
    else controls.dollyOut(stepFactor)

    controls.update()

    if (t < 1) {
      activeZoomRaf = requestAnimationFrame(tick)
      return
    }

    activeZoomRaf = null
  }

  activeZoomRaf = requestAnimationFrame(tick)
}

export const useThreeModelController = create<ThreeModelControllerState>()(
  (set, get) => ({
    controls: undefined,
    camera: undefined,
    autoRotate: false,
    setControls: (controls) => set({ controls }),
    setCamera: (camera) => set({ camera }),
    setAutoRotate: (next) => {
      const controls = get().controls
      if (controls) {
        controls.autoRotate = next
        controls.update()
      }
      set({ autoRotate: next })
    },
    zoomIn: () => {
      const controls = get().controls
      if (!controls) return
      smoothDolly(controls, 'out', 4)
    },
    zoomOut: () => {
      const controls = get().controls
      if (!controls) return
      smoothDolly(controls, 'in', 4)
    },
    resetView: () => {
      const controls = get().controls
      if (!controls) return
      cancelActiveZoom()
      controls.reset()
      controls.update()
    },
  })
)

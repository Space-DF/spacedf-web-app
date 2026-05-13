import { create } from 'zustand'
import { Vector3, type Camera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

type DollyDirection = 'in' | 'out'

type ThreeModelControllerState = {
  controls?: OrbitControlsImpl
  camera?: Camera
  autoRotate: boolean
  focusBaseRadius?: number
  setControls: (controls?: OrbitControlsImpl) => void
  setCamera: (camera?: Camera) => void
  setAutoRotate: (next: boolean) => void
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  focusOnWorldPoint: (
    worldTarget: Vector3,
    opts?: { zoomInFactor?: number; durationMs?: number }
  ) => void
}

let activeZoomRaf: number | null = null
let activeFocusRaf: number | null = null

function cancelActiveZoom() {
  if (activeZoomRaf == null) return
  cancelAnimationFrame(activeZoomRaf)
  activeZoomRaf = null
}

function cancelActiveFocus() {
  if (activeFocusRaf == null) return
  cancelAnimationFrame(activeFocusRaf)
  activeFocusRaf = null
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

function smoothFocusOnWorldPoint(
  controls: OrbitControlsImpl,
  worldTarget: Vector3,
  durationMs: number,
  zoomInFactor: number,
  focusBaseRadius?: number
) {
  cancelActiveFocus()
  cancelActiveZoom()

  const start = performance.now()
  const startTarget = controls.target.clone()
  const cam = controls.object
  const startCam = cam.position.clone()
  const startOffset = startCam.clone().sub(startTarget)
  const startRadius = startOffset.length()
  const dir =
    startRadius > 1e-12 ? startOffset.clone().normalize() : new Vector3(0, 0, 1)

  const minDistance = (controls as any).minDistance as number | undefined
  const baseRadius = focusBaseRadius ?? startRadius
  const endRadiusRaw = baseRadius * zoomInFactor
  const endRadius = Math.max(minDistance ?? 0.01, endRadiusRaw)

  const tick = () => {
    const now = performance.now()
    const t = Math.min(1, (now - start) / durationMs)
    const eased = 1 - Math.pow(1 - t, 3)

    controls.target.copy(startTarget).lerp(worldTarget, eased)
    const radius = startRadius + (endRadius - startRadius) * eased
    cam.position.copy(controls.target).addScaledVector(dir, radius)

    controls.update()

    if (t < 1) {
      activeFocusRaf = requestAnimationFrame(tick)
      return
    }

    activeFocusRaf = null
  }

  activeFocusRaf = requestAnimationFrame(tick)
}

export const useThreeModelController = create<ThreeModelControllerState>()(
  (set, get) => ({
    controls: undefined,
    camera: undefined,
    autoRotate: false,
    focusBaseRadius: undefined,
    setControls: (controls) => {
      if (!controls) {
        set({ controls: undefined, focusBaseRadius: undefined })
        return
      }
      set({ controls, focusBaseRadius: undefined })
    },
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
      cancelActiveFocus()
      controls.reset()
      const cam = controls.object
      const startOffset = cam.position.clone().sub(controls.target)
      const startRadius = startOffset.length()
      set({ focusBaseRadius: startRadius })
      controls.update()
    },
    focusOnWorldPoint: (worldTarget, opts) => {
      const controls = get().controls
      if (!controls) return
      let focusBaseRadius = get().focusBaseRadius
      if (focusBaseRadius == null) {
        const cam = controls.object
        const offset = cam.position.clone().sub(controls.target)
        focusBaseRadius = offset.length()
        set({ focusBaseRadius })
      }
      smoothFocusOnWorldPoint(
        controls,
        worldTarget,
        opts?.durationMs ?? 1100,
        opts?.zoomInFactor ?? 0.2,
        focusBaseRadius
      )
    },
  })
)

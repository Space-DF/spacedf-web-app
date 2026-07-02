class PulseController {
  time = 0
  private animationFrameId?: number

  start(onUpdate: () => void) {
    const start = performance.now()

    const loop = () => {
      this.time = (performance.now() - start) / 1000
      onUpdate()
      this.animationFrameId = requestAnimationFrame(loop)
    }

    this.animationFrameId = requestAnimationFrame(loop)
  }

  stop() {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = undefined
    }
    this.time = 0
  }
}

export const pulseController = new PulseController()

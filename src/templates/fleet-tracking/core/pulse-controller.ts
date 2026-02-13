import { animate, linear } from 'popmotion'

class PulseController {
  time = 0
  private stopFn?: () => void

  start(onUpdate: () => void) {
    const start = performance.now()

    this.stopFn = animate({
      from: 0,
      to: Infinity,
      duration: Infinity,
      ease: linear,
      onUpdate: () => {
        this.time = (performance.now() - start) / 1000
        onUpdate()
      },
    }).stop
  }

  stop() {
    this.stopFn?.()
    this.stopFn = undefined
    this.time = 0
  }
}

export const pulseController = new PulseController()

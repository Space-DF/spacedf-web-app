class EventEmitter {
  private events: Record<string, Function[]> = {}

  on(event: string, handler: Function) {
    this.events[event] = this.events[event] || []
    this.events[event].push(handler)
  }

  off(event: string, handler: Function) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter((h) => h !== handler)
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return
    this.events[event].forEach((handler) => handler(data))
  }
}

export default EventEmitter

import { BaseMQTTHandler, MQTTMessagePayload } from './base-handler'

export class MQTTRouter {
  private handlers: BaseMQTTHandler[] = []

  registerHandler(handler: BaseMQTTHandler): void {
    this.handlers.push(handler)
  }

  routeMessage(topic: string, payload: Buffer): any[] {
    try {
      const payloadString = new TextDecoder().decode(payload)
      const payloadJson: MQTTMessagePayload = JSON.parse(payloadString)

      console.log('📥 MQTT received', topic, payloadJson)

      // Find and execute matching handlers
      const matchingHandlers = this.handlers.filter((handler) =>
        handler.canHandle(topic)
      )

      if (matchingHandlers.length === 0) {
        console.warn('⚠️  No handler found for topic:', topic)
        return []
      }

      const results = matchingHandlers
        .map((handler) => handler.handle(topic, payloadJson))
        .filter((result) => result !== null && result !== undefined)

      return results
    } catch (error) {
      console.error('❌ Error routing MQTT message:', error)
      return []
    }
  }

  getRegisteredHandlers(): string[] {
    return this.handlers.map((handler) => handler.topicPattern)
  }
}

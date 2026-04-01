import { BaseMQTTHandler, MQTTMessagePayload } from './base-handler'
import type {
  TelemetryAutomation,
  TelemetryEvent,
  TelemetryEventGeofence,
  TelemetryEventPayload,
} from '@/types/event'

export interface DeviceEventData {
  deviceId: string
  event: TelemetryEvent
}

export class EventHandler extends BaseMQTTHandler {
  private readonly topicPatterns = [
    'tenant/+/space/+/device/+/event',
    'tenant/+/device/+/event',
  ]

  constructor() {
    super()
  }

  get topicPattern(): string {
    return this.topicPatterns[0]
  }

  canHandle(topic: string): boolean {
    return this.topicPatterns.some((pattern) =>
      this.matchesWildcardPattern(topic, pattern)
    )
  }

  handle(topic: string, payload: MQTTMessagePayload): DeviceEventData | null {
    try {
      const deviceId =
        this.extractDeviceId(topic) || this.coerceDeviceId(payload)

      if (!deviceId) {
        console.warn('❌ Could not extract device ID from topic:', topic)
        return null
      }

      const event = this.normalizeEvent(payload)
      if (!event || !event.id) return null

      return { deviceId, event }
    } catch (error) {
      console.error('❌ Error handling device events:', error)
      return null
    }
  }

  private extractDeviceId(topic: string): string | null {
    const topicParts = topic.split('/')
    const deviceIndex = topicParts.indexOf('device')
    if (deviceIndex === -1 || deviceIndex === topicParts.length - 1) return null
    return topicParts[deviceIndex + 1] || null
  }

  private coerceDeviceId(payload: MQTTMessagePayload): string | null {
    const candidate = (payload as any)?.device_id ?? (payload as any)?.deviceId
    return typeof candidate === 'string' && candidate.trim() ? candidate : null
  }

  private normalizeEvent(payload: MQTTMessagePayload): TelemetryEvent {
    const p = payload as TelemetryEventPayload

    const {
      event_type,
      event_level,
      title,
      time_fired_ts,
      event_id: id,
      location,
    } = p
    const time_fired = time_fired_ts
    const geofence = (
      p.geofence_id
        ? {
            id: p.geofence_id,
            name: p.geofence_name,
          }
        : undefined
    ) as TelemetryEventGeofence | undefined
    const automation = (
      p.automation_id
        ? {
            id: p.automation_id,
            name: p.automation_name,
          }
        : undefined
    ) as TelemetryAutomation | undefined
    return {
      id,
      event_type,
      event_level,
      title,
      time_fired,
      location,
      ...(geofence ? { geofence } : {}),
      ...(automation ? { automation } : {}),
    }
  }
}

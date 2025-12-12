import { Device } from '@/stores/device-store'
import { BaseMQTTHandler, MQTTMessagePayload } from './base-handler'

export interface DeviceTelemetryData {
  deviceId: string
  deviceUpdate: Partial<Device>
}

export class DeviceTelemetryHandler extends BaseMQTTHandler {
  private readonly topicPatterns = [
    'tenant/+/space/+/device/+/telemetry',
    'tenant/+/device/+/telemetry',
  ]

  constructor() {
    super()
  }

  get topicPattern(): string {
    // Return first pattern for compatibility, but we check all patterns
    return this.topicPatterns[0]
  }

  canHandle(topic: string): boolean {
    return this.topicPatterns.some((pattern) =>
      this.matchesWildcardPattern(topic, pattern)
    )
  }

  handle(
    topic: string,
    payload: MQTTMessagePayload
  ): DeviceTelemetryData | null {
    try {
      const deviceId = this.extractDeviceId(topic)

      if (!deviceId) {
        console.warn('❌ Could not extract device ID from topic:', topic)
        return null
      }

      const deviceUpdate = this.parseDeviceData(payload)

      if (Object.keys(deviceUpdate).length > 0) {
        return { deviceId, deviceUpdate }
      }

      return null
    } catch (error) {
      console.error('❌ Error handling device telemetry:', error)
      return null
    }
  }

  private extractDeviceId(topic: string): string | null {
    const topicParts = topic.split('/')

    const deviceIndex = topicParts.indexOf('device')

    if (deviceIndex === -1 || deviceIndex === topicParts.length - 1) {
      return null
    }
    return topicParts[deviceIndex + 1] || null
  }

  private parseDeviceData(payload: MQTTMessagePayload): Partial<Device> {
    const deviceUpdate: Partial<Device> = {
      ...payload,
    }

    // Handle location updates
    if (payload.location?.latitude && payload.location?.longitude) {
      deviceUpdate.deviceProperties = {
        ...deviceUpdate.deviceProperties,
        latest_checkpoint_arr: [
          payload.location.longitude,
          payload.location.latitude,
        ],
      }
    }

    return deviceUpdate
  }
}

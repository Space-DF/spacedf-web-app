import { Device, useDeviceStore } from '@/stores/device-store'
import { BaseMQTTHandler, MQTTMessagePayload } from './base-handler'

export class DeviceTelemetryHandler extends BaseMQTTHandler {
  readonly topicPattern = 'device/+/telemetry'

  constructor(private deviceStore: typeof useDeviceStore) {
    super()
  }

  canHandle(topic: string): boolean {
    return this.matchesWildcardPattern(topic, this.topicPattern)
  }

  handle(topic: string, payload: MQTTMessagePayload): void {
    try {
      const _params = this.extractTopicParams(topic, this.topicPattern)
      const deviceId = this.extractDeviceId(topic)

      if (!deviceId) {
        console.warn('❌ Could not extract device ID from topic:', topic)
        return
      }

      const deviceUpdate = this.parseDeviceData(payload)

      if (Object.keys(deviceUpdate).length > 0) {
        console.log('📡 [DEBUG] MQTT triggering device state update:', {
          deviceId,
          topic,
          rawPayload: payload,
          parsedUpdate: deviceUpdate,
          timestamp: new Date().toISOString(),
        })

        this.deviceStore.getState().setDeviceState(deviceId, deviceUpdate)

        console.log(
          '✅ [DEBUG] MQTT device state update completed for:',
          deviceId
        )
      } else {
        console.log(
          '⚠️ [DEBUG] MQTT message received but no valid device data found:',
          {
            deviceId,
            topic,
            payload,
            timestamp: new Date().toISOString(),
          }
        )
      }
    } catch (error) {
      console.error('❌ Error handling device telemetry:', error)
    }
  }

  private extractDeviceId(topic: string): string | null {
    const topicParts = topic.split('/')
    return topicParts.length >= 2 ? topicParts[1] : null
  }

  private parseDeviceData(payload: MQTTMessagePayload): Partial<Device> {
    const deviceUpdate: Partial<Device> = {}

    console.log('🔍 [DEBUG] Parsing device data from payload:', payload)

    // Handle location updates
    if (payload.location?.latitude && payload.location?.longitude) {
      deviceUpdate.latestLocation = [
        payload.location.longitude,
        payload.location.latitude,
      ]
      console.log(
        '📍 [DEBUG] Location parsed (location.lat/lng format):',
        deviceUpdate.latestLocation
      )
    } else {
      console.log('❌ [DEBUG] No valid location data found in payload')
    }

    console.log('✅ [DEBUG] Final parsed device update:', deviceUpdate)

    return deviceUpdate
  }
}

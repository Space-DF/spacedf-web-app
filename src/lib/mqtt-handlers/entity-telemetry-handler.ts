import { Entity } from '@/types/entity'
import { BaseMQTTHandler, MQTTMessagePayload } from './base-handler'

export interface EntityTelemetryData {
  entityId: string
  entityType: string
  entityUpdate: Partial<Entity> & { state?: any }
}

export class EntityTelemetryHandler extends BaseMQTTHandler {
  private readonly topicPatterns = [
    'tenant/+/space/+/entity/+/telemetry',
    'tenant/+/entity/+/telemetry',
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

  handle(
    topic: string,
    payload: MQTTMessagePayload
  ): EntityTelemetryData | null {
    try {
      const entityId = this.extractEntityId(topic)

      if (!entityId) {
        console.warn('❌ Could not extract entity ID from topic:', topic)
        return null
      }

      const entityType = this.extractEntityType(payload)
      const entityUpdate = this.normalizeEntityData(entityType, payload)

      if (Object.keys(entityUpdate).length > 0) {
        return { entityId, entityType, entityUpdate }
      }

      return null
    } catch (error) {
      console.error('❌ Error handling entity telemetry:', error)
      return null
    }
  }

  private extractEntityId(topic: string): string | null {
    const topicParts = topic.split('/')
    const entityIndex = topicParts.indexOf('entity')

    if (entityIndex === -1 || entityIndex === topicParts.length - 1) {
      return null
    }
    return topicParts[entityIndex + 1] || null
  }

  private extractEntityType(payload: MQTTMessagePayload): string {
    return payload.entity?.entity_type || 'unknown'
  }

  private normalizeEntityData(
    entityType: string,
    payload: MQTTMessagePayload
  ): Partial<Entity> & { state?: any } {
    switch (entityType) {
      case 'water_depth':
        return this.normalizeWaterDepthData(payload)
      // case 'location':
      //   return this.normalizeLocationData(payload)
      // case 'battery':
      //   return this.normalizeBatteryData(payload)
      default:
        return { ...payload }
    }
  }

  private normalizeWaterDepthData(
    payload: MQTTMessagePayload
  ): Partial<Entity> & { state?: any } {
    const entity = payload.entity || {}

    return {
      device_id: payload.device_id,
      name: entity.name,
      unit_of_measurement: entity.unit_of_measurement,
      updated_at:
        entity.timestamp || payload.timestamp || new Date().toISOString(),
      state: entity.state,
      ...entity,
    }
  }
}

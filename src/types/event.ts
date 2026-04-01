export interface TelemetryEventGeofence {
  id: string
  name: string
  type_zone: string
}

export interface TelemetryAutomation {
  id: string
  name: string
}

interface TelemetryEventLocation {
  latitude: number
  longitude: number
}

export interface TelemetryEvent {
  id: number
  event_type: string
  event_level: string
  title: string
  entity_id?: string
  time_fired: string
  geofence?: TelemetryEventGeofence
  automation?: TelemetryAutomation
  location?: TelemetryEventLocation
}

export interface TelemetryEventPayload {
  device_id: string
  event_id: number
  automation_id: string
  automation_name: string
  event_level: string
  event_rule_id: string
  event_type: string
  event_type_id: number
  geofence_id: string
  geofence_name: string
  location: {
    latitude: number
    longitude: number
  }
  organization: string
  space_slug: string
  state_id: string
  time_fired_ts: string
  title: string
}

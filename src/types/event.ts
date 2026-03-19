interface TelemetryEventGeofence {
  id: string
  name: string
  type_zone: string
}

interface TelemetryAutomation {
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
  entity_id: string
  time_fired: string
  geofence?: TelemetryEventGeofence
  automation?: TelemetryAutomation
  location?: TelemetryEventLocation
}

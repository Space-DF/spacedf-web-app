export type FeatureId = number | string

export type Coordinate = [number, number]

export type PolygonGeometry = {
  coordinates: Coordinate[][]
  properties: NormalizedPolygonProperties
}

export type GeofenceCondition =
  | { time_between: { start: string; end: string } }
  | { weekday_in: number[] }
  | { distance_from_geofence_km: { lte: number } }
  | { and: GeofenceCondition[] }
  | { or: GeofenceCondition[] }
  | { not: GeofenceCondition[] }

export type NormalizedPolygon = {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: Coordinate[][]
  properties: NormalizedPolygonProperties
}

export type NormalizedPolygonProperties = {
  color?: string
  type?: string
  mode?: 'rectangle' | 'angled-rectangle' | string
  id?: string
}

export interface EventRule {
  definition: {
    conditions: {
      and: GeofenceCondition[]
    }
  }
}

export type GeofenceTestPayload = {
  type_zone: 'safe' | 'danger'
  features: PolygonGeometry[]
} & EventRule

export interface Geofence extends Omit<GeofenceTestPayload, 'definition'> {
  id: string
  name: string
  color: string
  event_rule: EventRule
}

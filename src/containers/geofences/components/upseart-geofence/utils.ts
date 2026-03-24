import { GeofenceForm } from './schema'
import { parse, format } from 'date-fns'
import {
  Coordinate,
  GeofenceCondition,
  NormalizedPolygon,
  NormalizedPolygonProperties,
} from '@/types/geofence'
import { DEFAULT_GEOFENCE_COLOR } from '@/stores/geofence-store'

type GeofenceRule = GeofenceForm['conditions'][number]

const to24HourTime = (time: string, meridiem: 'am' | 'pm'): string => {
  const date = parse(`${time} ${meridiem.toUpperCase()}`, 'h:mm a', new Date())
  return format(date, 'HH:mm')
}

const mapRuleToBackend = (
  rule: GeofenceRule,
  type_zone: 'safe' | 'danger'
): GeofenceCondition => {
  switch (rule.type) {
    case 'time': {
      const parts: GeofenceCondition[] = []

      if (rule.weekdays.length > 0) {
        parts.push({ weekday_in: rule.weekdays })
      }

      parts.push({
        time_between: {
          start: to24HourTime(rule.after, rule.after_type),
          end: to24HourTime(rule.before, rule.before_type),
        },
      })
      return parts.length === 1 ? parts[0] : { and: parts }
    }

    case 'distance_threshold': {
      const distanceKm =
        rule.unit === 'km' ? rule.threshold : rule.threshold / 1000

      return {
        distance_from_geofence_km:
          type_zone === 'safe' ? { gte: distanceKm } : { lte: distanceKm },
      }
    }

    case 'and':
      return {
        and: rule.rules.map((r: GeofenceRule) =>
          mapRuleToBackend(r, type_zone)
        ),
      }

    case 'or':
      return {
        or: rule.rules.map((r: GeofenceRule) => mapRuleToBackend(r, type_zone)),
      }

    case 'not':
      return {
        not: rule.rules.map((r: GeofenceRule) =>
          mapRuleToBackend(r, type_zone)
        ),
      }

    default:
      return { and: [] }
  }
}

export const transformConditions = (
  conditions: GeofenceForm['conditions'],
  type_zone: 'safe' | 'danger'
) => {
  return {
    conditions: {
      and: conditions.map((c) => mapRuleToBackend(c, type_zone)),
    },
  }
}

const from12HourTime = (
  time24: string
): { time: string; meridiem: 'am' | 'pm' } => {
  const date = parse(time24, 'HH:mm', new Date())
  const formatted = format(date, 'h:mm a')
  const [time, period] = formatted.split(' ')
  return { time, meridiem: period.toLowerCase() as 'am' | 'pm' }
}

const tryParseTimeCondition = (
  parts: GeofenceCondition[]
): GeofenceRule | null => {
  let weekdays: number[] = []
  let timeBetween: { start: string; end: string } | null = null

  for (const part of parts) {
    if ('weekday_in' in part) {
      weekdays = part.weekday_in
    } else if ('time_between' in part) {
      timeBetween = part.time_between
    } else {
      return null
    }
  }

  if (!timeBetween) return null

  const after = from12HourTime(timeBetween.start)
  const before = from12HourTime(timeBetween.end)

  return {
    type: 'time' as const,
    after: after.time,
    after_type: after.meridiem,
    before: before.time,
    before_type: before.meridiem,
    weekdays,
  } as GeofenceRule
}

const mapBackendToRule = (condition: GeofenceCondition): GeofenceRule => {
  if ('time_between' in condition) {
    const after = from12HourTime(condition.time_between.start)
    const before = from12HourTime(condition.time_between.end)

    return {
      type: 'time',
      after: after.time,
      after_type: after.meridiem,
      before: before.time,
      before_type: before.meridiem,
      weekdays: [],
    } as GeofenceRule
  }

  if ('weekday_in' in condition) {
    return {
      type: 'time',
      after: '12:00',
      after_type: 'am',
      before: '12:00',
      before_type: 'pm',
      weekdays: condition.weekday_in,
    } as GeofenceRule
  }

  if ('distance_from_geofence_km' in condition) {
    const distanceKm =
      condition.distance_from_geofence_km.lte ??
      condition.distance_from_geofence_km.gte
    return {
      type: 'distance_threshold',
      threshold: distanceKm,
      unit: 'km',
    } as GeofenceRule
  }

  if ('and' in condition) {
    const timeRule = tryParseTimeCondition(condition.and)
    if (timeRule) return timeRule

    return {
      type: 'and',
      rules: condition.and.map(mapBackendToRule),
    } as GeofenceRule
  }

  if ('or' in condition) {
    return {
      type: 'or',
      rules: condition.or.map(mapBackendToRule),
    } as GeofenceRule
  }

  if ('not' in condition) {
    return {
      type: 'not',
      rules: condition.not.map(mapBackendToRule),
    } as GeofenceRule
  }

  return { type: 'and', rules: [] } as GeofenceRule
}

export const parseConditions = (
  conditions: { and: GeofenceCondition[] } | undefined
): GeofenceForm['conditions'] => {
  if (!conditions?.and) return []
  return conditions.and.map(mapBackendToRule)
}

export function toCoordinate(pos: number[]): Coordinate {
  return [pos[0] ?? 0, pos[1] ?? 0]
}

export function toPolygonGeometry(geom: {
  type: string
  coordinates: Coordinate[][]
  properties: NormalizedPolygonProperties
}): NormalizedPolygon {
  if (geom.type === 'Polygon') {
    const rings = geom.coordinates as Coordinate[][]
    return {
      type: 'Polygon',
      coordinates: rings.map((ring) => ring.map((pos) => toCoordinate(pos))),
      properties: geom.properties,
    }
  }
  if (geom.type === 'MultiPolygon') {
    const polygons = geom.coordinates as Coordinate[][]
    return {
      type: 'MultiPolygon',
      coordinates: polygons,
      properties: geom.properties,
    }
  }
  throw new Error(`Unsupported geometry type: ${geom.type}`)
}

export function featuresToGeometries(
  features: Array<{
    geometry: { type: string; coordinates: unknown }
    properties: NormalizedPolygonProperties
  }>
): NormalizedPolygon[] {
  return features
    .filter(
      (f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
    )
    .map((f) =>
      toPolygonGeometry({
        type: f.geometry.type,
        coordinates: f.geometry.coordinates as Coordinate[][],
        properties: f.properties,
      })
    )
}

export const toHexColor = (color?: string) =>
  color === 'default' || !color
    ? DEFAULT_GEOFENCE_COLOR
    : color.startsWith('#')
      ? color
      : `#${color}`

export function hexWithOpacity(hex: string, opacity: number): `#${string}` {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()

  return (hex + alpha) as `#${string}`
}

export const hasEmptyWeekdays = (
  rule: GeofenceForm['conditions'][number]
): boolean => {
  switch (rule.type) {
    case 'time':
      return rule.weekdays.length === 0
    case 'and':
    case 'or':
    case 'not':
      return rule.rules.some(hasEmptyWeekdays)
    default:
      return false
  }
}

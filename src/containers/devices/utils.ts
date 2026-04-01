import { TelemetryEvent } from '@/types/event'

export const formatValueEUI = (value: string) => {
  const hexOnly = value.replace(/[^0-9A-Fa-f]/g, '')

  const groups = []
  for (let i = 0; i < hexOnly.length; i += 2) {
    groups.push(hexOnly.substring(i, i + 2))
  }

  return groups.join(' ')
}

export function countTwoDigitNumbers(str?: string) {
  if (!str) return 0
  const numbers = str.split(' ')
  return numbers.filter((num) => num.length === 2).length
}

export const mergeEvents = (
  apiEvents: TelemetryEvent[],
  mqttEvents: TelemetryEvent[]
): TelemetryEvent[] => {
  const byId = new Map<number, TelemetryEvent>()
  apiEvents.forEach((e) => byId.set(e.id, e))
  mqttEvents.forEach((e) => byId.set(e.id, e))
  return Array.from(byId.values()).sort((a, b) => {
    return Date.parse(`${b.time_fired}`) - Date.parse(`${a.time_fired}`)
  })
}

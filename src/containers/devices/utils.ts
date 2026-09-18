import { TelemetryEvent } from '@/types/event'

export const mergeEvents = (
  apiEvents: TelemetryEvent[],
  mqttEvents: TelemetryEvent[],
  searchQuery?: string
): TelemetryEvent[] => {
  const byId = new Map<number, TelemetryEvent>()
  apiEvents.forEach((e) => byId.set(e.id, e))
  mqttEvents.forEach((e) => byId.set(e.id, e))
  const filteredEvents = Array.from(byId.values()).filter((e) => {
    if (!searchQuery) return true
    const title = e.title.toLowerCase()
    return title.includes(searchQuery.toLowerCase())
  })
  return filteredEvents.sort(
    (a, b) => Date.parse(`${b.time_fired}`) - Date.parse(`${a.time_fired}`)
  )
}

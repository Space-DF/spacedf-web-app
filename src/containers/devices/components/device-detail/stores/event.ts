import { TelemetryEvent } from '@/types/event'
import { create } from 'zustand'

interface EventStore {
  eventDevices: Record<string, TelemetryEvent[]>
  setEventDevices: (devices: Record<string, TelemetryEvent[]>) => void
  insertDeviceEvents: (deviceId: string, event: TelemetryEvent) => void
}

const MAX_EVENTS_PER_DEVICE = 200

export const useEventStore = create<EventStore>((set, get) => ({
  eventDevices: {},
  setEventDevices: (devices) => set({ eventDevices: devices }),
  insertDeviceEvents: (deviceId, event) => {
    if (!deviceId || !event) return

    const current = get().eventDevices[deviceId] ?? []

    set((state) => ({
      eventDevices: {
        ...state.eventDevices,
        [deviceId]: [event, ...current].slice(0, MAX_EVENTS_PER_DEVICE),
      },
    }))
  },
}))

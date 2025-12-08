import { PaginationResponse } from './../types/global.d'
import { Device as StoreDevice } from '@/stores/device-store'
import { DeviceSpace } from '@/types/device-space'
import { Device as ApiDevice } from '@/types/device'
import { Trip } from '@/types/trip'
import { Entity } from '@/types/entity'

export const devices: StoreDevice[] = [
  {
    name: 'Rak 4630-RS3-C1F4',
    id: 'rak4630-rs3-C1F4',
    status: 'active',
    template: '123',
    type: 'rak',
    location: [108.22003, 16.05486],
    layerProps: {
      sizeScale: 200,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 90,
        roll: 90,
      },
    },
    histories: {
      end: [108.22003, 16.05486],
      start: [108.2265, 16.0578],
    },
    latestLocation: [108.22003, 16.05486],
    realtimeTrip: [[108.22003, 16.05486]],
    origin: 'Vietnam',
  },

  {
    name: 'RAK Sticker_50E5',
    id: 'RAK_Sticker_50E5',
    status: 'active',
    template: '456',
    type: 'rak',
    location: [108.222, 16.05487],
    layerProps: {
      sizeScale: 200,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 90,
        roll: 90,
      },
    },
    histories: {
      end: [108.222, 16.05487],
      start: [108.2142447, 16.0604518],
    },
    latestLocation: [108.222, 16.05487],
    realtimeTrip: [[108.222, 16.05487]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 01 -1511-M03',
    id: '3',
    status: 'active',
    battery: 90,
    type: 'tracki',
    location: [108.221, 16.05485],
    layerProps: {
      sizeScale: 700,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 360,
        roll: 180,
      },
    },
    histories: {
      end: [108.221, 16.05485],
      start: [108.2247397, 16.0485692],
    },
    latestLocation: [108.221, 16.05485],
    realtimeTrip: [[108.221, 16.05485]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 02 -1512-M01',
    id: '4',
    status: 'inactive',
    battery: 45,
    type: 'tracki',
    location: [108.215, 16.062],
    layerProps: {
      sizeScale: 500,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 360,
        roll: 180,
      },
    },
    histories: {
      end: [108.215, 16.062],
      start: [108.217, 16.064],
    },
    latestLocation: [108.215, 16.062],
    realtimeTrip: [[108.215, 16.062]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 03 -1513-M01',
    id: '5',
    status: 'active',
    template: '789',
    type: 'rak',
    location: [108.228, 16.048],
    layerProps: {
      sizeScale: 300,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 90,
        roll: 90,
      },
    },
    histories: {
      end: [108.228, 16.048],
      start: [108.23, 16.05],
    },
    latestLocation: [108.228, 16.048],
    realtimeTrip: [[108.228, 16.048]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 04 -1514-M01',
    id: '6',
    status: 'active',
    battery: 75,
    type: 'tracki',
    location: [108.235, 16.058],
    layerProps: {
      sizeScale: 600,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 360,
        roll: 180,
      },
    },
    histories: {
      end: [108.235, 16.058],
      start: [108.237, 16.06],
    },
    latestLocation: [108.235, 16.058],
    realtimeTrip: [[108.235, 16.058]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 05 -1515-M01',
    id: '7',
    status: 'inactive',
    template: '101',
    type: 'rak',
    location: [108.212, 16.052],
    layerProps: {
      sizeScale: 400,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 90,
        roll: 90,
      },
    },
    histories: {
      end: [108.212, 16.052],
      start: [108.214, 16.054],
    },
    latestLocation: [108.212, 16.052],
    realtimeTrip: [[108.212, 16.052]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 06 -1516-M01',
    id: '8',
    status: 'active',
    battery: 85,
    type: 'tracki',
    location: [108.242, 16.065],
    layerProps: {
      sizeScale: 550,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 360,
        roll: 180,
      },
    },
    histories: {
      end: [108.242, 16.065],
      start: [108.244, 16.067],
    },
    latestLocation: [108.242, 16.065],
    realtimeTrip: [[108.242, 16.065]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 07 -1517-M01',
    id: '9',
    status: 'active',
    template: '202',
    type: 'rak',
    location: [108.205, 16.045],
    layerProps: {
      sizeScale: 350,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 90,
        roll: 90,
      },
    },
    histories: {
      end: [108.205, 16.045],
      start: [108.207, 16.047],
    },
    latestLocation: [108.205, 16.045],
    realtimeTrip: [[108.205, 16.045]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 08 -1518-M01',
    id: '10',
    status: 'inactive',
    battery: 30,
    type: 'tracki',
    location: [108.238, 16.042],
    layerProps: {
      sizeScale: 650,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 360,
        roll: 180,
      },
    },
    histories: {
      end: [108.238, 16.042],
      start: [108.24, 16.044],
    },
    latestLocation: [108.238, 16.042],
    realtimeTrip: [[108.238, 16.042]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 09 -1519-M01',
    id: '11',
    status: 'active',
    template: '303',
    type: 'rak',
    location: [108.208, 16.068],
    layerProps: {
      sizeScale: 450,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 90,
        roll: 90,
      },
    },
    histories: {
      end: [108.208, 16.068],
      start: [108.21, 16.07],
    },
    latestLocation: [108.208, 16.068],
    realtimeTrip: [[108.208, 16.068]],
    origin: 'Vietnam',
  },
  {
    name: 'DMZ 10 -1520-M01',
    id: '12',
    status: 'active',
    battery: 95,
    type: 'tracki',
    location: [108.232, 16.072],
    layerProps: {
      sizeScale: 500,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 360,
        roll: 180,
      },
    },
    histories: {
      end: [108.232, 16.072],
      start: [108.234, 16.074],
    },
    latestLocation: [108.232, 16.072],
    realtimeTrip: [[108.232, 16.072]],
    origin: 'Vietnam',
  },
]

export const deviceSpaces: DeviceSpace[] = devices.map((d) => {
  const apiDevice: ApiDevice = {
    id: d.id,
    device_id: d.deviceId,
    device_name: d.name,
    device_connector: 'connector1',
    device_model: d.type ?? 'rak',
    status: d.status,
    lorawan_device: {
      name: d.name,
      dev_eui: d.id,
      location: d.origin ?? 'Unknown',
      tags: [],
    },
    type: d.type,
  }

  const latest_checkpoint = d.latestLocation
    ? {
        longitude: d.latestLocation[0],
        latitude: d.latestLocation[1],
        timestamp: new Date().toISOString(),
        accuracy: 0,
      }
    : undefined

  return {
    id: d.id,
    name: d.name,
    description: d.name,
    device: apiDevice,
    latest_checkpoint,
  }
})

export const dummyTrips: Trip[] = deviceSpaces.map((space, index) => {
  const source = devices[index]
  const now = new Date().toISOString()

  const checkpointsFromHistories: {
    latitude: number
    longitude: number
    timestamp: string
    accuracy: number
  }[] = []

  if (source?.histories?.start) {
    checkpointsFromHistories.push({
      longitude: source.histories.start[0],
      latitude: source.histories.start[1],
      timestamp: now,
      accuracy: 0,
    })
  }

  if (source?.histories?.start) {
    checkpointsFromHistories.push({
      longitude: source.histories.end[0],
      latitude: source.histories.end[1],
      timestamp: now,
      accuracy: 0,
    })
  }

  return {
    id: String(index + 1),
    space_device: space.id,
    started_at: checkpointsFromHistories[0]?.timestamp ?? now,
    checkpoints: checkpointsFromHistories,
    space_device_id: space.id,
    device_id: space.device.id,
    device_name: space.device.device_name,
    is_finished: false,
    last_latitude: checkpointsFromHistories[0]?.latitude ?? 0,
    last_longitude: checkpointsFromHistories[0]?.longitude ?? 0,
    last_report: checkpointsFromHistories[0]?.timestamp ?? now,
  }
})

export const dummyEntities: PaginationResponse<Entity> = {
  count: 3,
  next: undefined,
  previous: undefined,
  results: [
    {
      id: '02e34032-9e35-4560-b6a1-735d65ecc683',
      device_id: '460c440a-f721-d214-0000-000000000001',
      device_name: 'rak demo',
      unique_key: 'rak4630_460c440af721d214_temperature',
      entity_type: {
        id: '1aeeaa9b-1111-2222-3333-444444444444',
        name: 'Device tracker',
        unique_key: 'device_tracker',
        image_url: 'https://cdn.app.com/icons/device_tracker.png',
      },
      name: 'Temperature for RAK4630',
      category: 'temperature',
      unit_of_measurement: '°C',
      display_type: 'chart',
      time_start: '2025-11-01T00:00:00Z',
      time_end: '2025-12-01T00:00:00Z',
      image_url: 'https://cdn.app.com/icons/temperature.png',
      is_enabled: true,
      created_at: '2025-11-01T08:00:00Z',
      updated_at: '2025-12-05T09:10:00Z',
    },
    {
      id: 'a13f503b-82c2-42e0-a5cc-3e7f38cd6621',
      device_id: '460c440a-f721-d214-0000-000000000002',
      device_name: 'rak demo 2',
      unique_key: 'rak4630_460c440af721d214_humidity',
      entity_type: {
        id: '1aeeaa9b-1111-2222-3333-444444444444',
        name: 'Device tracker',
        unique_key: 'device_tracker',
        image_url: 'https://cdn.app.com/icons/device_tracker.png',
      },
      name: 'Humidity for RAK4630',
      category: 'humidity',
      unit_of_measurement: '%',
      display_type: 'chart',
      time_start: '2025-11-01T00:00:00Z',
      time_end: '2025-12-01T00:00:00Z',
      image_url: 'https://cdn.app.com/icons/humidity.png',
      is_enabled: false,
      created_at: '2025-11-01T08:30:00Z',
      updated_at: '2025-12-05T09:20:00Z',
    },
    {
      id: 'b3c8cb9e-c590-4a69-b3ef-42d27042d44d',
      device_id: '460c440a-f721-d214-0000-000000000003',
      device_name: 'rak demo 3',
      unique_key: 'rak4630_460c440af721d214_voltage',
      entity_type: {
        id: '1aeeaa9b-1111-2222-3333-444444444444',
        name: 'Device tracker',
        unique_key: 'device_tracker',
        image_url: 'https://cdn.app.com/icons/device_tracker.png',
      },
      name: 'Voltage for RAK4630',
      category: 'voltage',
      unit_of_measurement: 'V',
      display_type: 'text',
      time_start: '2025-10-01T00:00:00Z',
      time_end: '2025-11-01T00:00:00Z',
      image_url: 'https://cdn.app.com/icons/voltage.png',
      is_enabled: true,
      created_at: '2025-10-01T10:00:00Z',
      updated_at: '2025-12-05T07:40:00Z',
    },
  ],
}

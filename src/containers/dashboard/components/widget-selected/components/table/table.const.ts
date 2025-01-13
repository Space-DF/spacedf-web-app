import { Device } from '@/validator'

export const DEVICES: Device[] = [
  {
    device_id: '42j5b4j8',
    device_name: 'Tracking Device',
    last_seen: 'Da Nang',
    battery: 80,
    status: true,
  },
  {
    device_id: 'a7b3d5f9',
    device_name: 'Smart Camera',
    last_seen: 'Da Nang',
    resolution: '1080p',
    battery: 100,
    status: false,
  },
  {
    device_id: 'z3y2g8w7',
    device_name: 'Temperature Sensor',
    last_seen: 'Da Nang',
    unit: 'Celsius',
    battery: 20,
    status: true,
  },
  {
    device_id: 't4p1q6r2',
    device_name: 'Humidity Sensor',
    last_seen: 'Da Nang',
    battery: 60,
    status: false,
  },
  {
    device_id: 'd3v8a9r6',
    device_name: 'Motion Sensor',
    last_seen: 'Da Nang',
    battery: 10,
    status: true,
  },
]

export const FIELD_DISPLAY_NAME: { [key: string]: string } = {
  device_id: 'Device ID',
  device_name: 'Device Name',
  last_seen: 'Last Seen',
  resolution: 'Resolution',
  unit: 'Unit',
}

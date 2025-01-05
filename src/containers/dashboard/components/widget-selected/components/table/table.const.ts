export interface Device {
  device_id: string
  device_name: string
  [key: string]: any
}

export const DEVICES: Device[] = [
  {
    device_id: '42j5b4j8',
    device_name: 'Tracking Device',
    last_seen: 'Da Nang',
  },
  {
    device_id: 'a7b3d5f9',
    device_name: 'Smart Camera',
    last_seen: 'Da Nang',
    resolution: '1080p',
  },
  {
    device_id: 'z3y2g8w7',
    device_name: 'Temperature Sensor',
    last_seen: 'Da Nang',
    unit: 'Celsius',
  },
  {
    device_id: 't4p1q6r2',
    device_name: 'Humidity Sensor',
    last_seen: 'Da Nang',
  },
  {
    device_id: 'd3v8a9r6',
    device_name: 'Motion Sensor',
    last_seen: 'Da Nang',
  },
]

export const FIELDDISPLAYNAME: { [key: string]: string } = {
  device_id: 'Device ID',
  device_name: 'Device Name',
  last_seen: 'Last Seen',
  resolution: 'Resolution',
  unit: 'Unit',
}

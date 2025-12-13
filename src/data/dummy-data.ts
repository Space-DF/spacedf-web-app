import { DeviceDataOriginal } from '@/types/device'
import { Entity } from '@/types/entity'
import { Trip } from '@/types/trip'
import { v4 as uuidv4 } from 'uuid'
import { PaginationResponse } from './../types/global.d'
import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'

export const deviceSpaces: DeviceDataOriginal[] = [
  {
    id: 'rak4630-rs3-C1F4',
    name: 'Rak 4630-RS3-C1F4',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'RAK2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.05486,
        longitude: 108.22003,
      },
    },
  },
  {
    id: 'RAK Sticker_50E5',
    name: 'RAK_Sticker_50E5',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'RAK2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.05487,
        longitude: 108.222,
      },
    },
  },
  {
    id: '3',
    name: 'DMZ 01 -1511-M03',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'TRACKI2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.05485,
        longitude: 108.221,
      },
    },
  },
  {
    id: '4',
    name: 'DMZ 02 -1512-M01',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'TRACKI2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.062,
        longitude: 108.215,
      },
    },
  },
  {
    id: '5',
    name: 'DMZ 03 -1513-M01',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'RAK2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.048,
        longitude: 108.228,
      },
    },
  },
  {
    id: '6',
    name: 'DMZ 04 -1514-M01',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'RAK2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.058,
        longitude: 108.235,
      },
    },
  },
  {
    id: '7',
    name: 'DMZ 05 -1515-M01',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'RAK2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.052,
        longitude: 108.212,
      },
    },
  },
  {
    id: '8',
    name: 'DMZ 06 -1516-M01',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'TRACKI2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.065,
        longitude: 108.242,
      },
    },
  },
  {
    id: '9',
    name: 'DMZ 07 -1517-M01',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'RAK2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.045,
        longitude: 108.205,
      },
    },
  },
  {
    id: '10',
    name: 'DMZ 08 -1518-M01',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'TRACKI2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.042,
        longitude: 108.238,
      },
    },
  },
  {
    id: '11',
    name: 'DMZ 09 -1519-M01',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'RAK2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.LOCATION,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    device_properties: {
      latest_checkpoint: {
        latitude: 16.068,
        longitude: 108.208,
      },
    },
  },
  {
    id: 'wlb-v1-123',
    name: 'Water Level Board V1',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'Water Level Board',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'WLBV1',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.WATER_DEPTH,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },

    device_properties: {
      latest_checkpoint: {
        latitude: 16.05598,
        longitude: 108.22038,
      },
      water_level: 50,
    },
  },
  {
    id: 'wlb-v2-123',
    name: 'Water Level Board V2',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'Water Level Board',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'WLBV1',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.WATER_DEPTH,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },

    device_properties: {
      latest_checkpoint: {
        latitude: 16.05698,
        longitude: 108.22138,
      },
      water_level: 150,
    },
  },
  {
    id: 'wlb-v3-123',
    name: 'Water Level Board V3',
    description: '',
    device: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'Water Level Board',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'WLBV1',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.WATER_DEPTH,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },

    device_properties: {
      latest_checkpoint: {
        latitude: 16.05698,
        longitude: 108.22238,
      },
      water_level: 20,
    },
  },
]

const histories = {
  end: [108.221, 16.05485],
  start: [108.2247397, 16.0485692],
}

export const dummyTrips: Trip[] = deviceSpaces.map((space, index) => {
  const now = new Date().toISOString()

  const checkpointsFromHistories: {
    latitude: number
    longitude: number
    timestamp: string
    accuracy: number
  }[] = []

  if (histories.start) {
    checkpointsFromHistories.push({
      longitude: histories.start[0],
      latitude: histories.start[1],
      timestamp: now,
      accuracy: 0,
    })
  }

  if (histories.start) {
    checkpointsFromHistories.push({
      longitude: histories.end[0],
      latitude: histories.end[1],
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
    device_name: space.name,
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

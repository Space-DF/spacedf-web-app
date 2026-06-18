import { DeviceDataOriginal } from '@/types/device'
import { Entity } from '@/types/entity'
import { Trip } from '@/types/trip'
import { PaginationResponse } from './../types/global.d'
import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { uuidv4 } from '@/utils'

export const deviceSpaces: DeviceDataOriginal[] = [
  {
    id: 'rak4630-rs3-C1F4',
    name: 'Rak 4630-RS3-C1F4',
    description: '',
    device: {
      id: 'rak4630-rs3-C1F4',
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
      direction: 120,
    },
  },
  {
    id: 'RAK_Sticker_50E5',
    name: 'RAK_Sticker_50E5',
    description: '',
    device: {
      id: 'RAK_Sticker_50E5',
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
      direction: 90,
    },
  },
  {
    id: 'DMZ_01_1511-M03',
    name: 'DMZ 01 -1511-M03',
    description: '',
    device: {
      id: 'DMZ_01_1511-M03',
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
      direction: 45,
    },
  },
  {
    id: 'DMZ_02_1512_M01',
    name: 'DMZ 02 -1512-M01',
    description: '',
    device: {
      id: 'DMZ_02_1512_M01',
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
      direction: 200,
    },
  },
  {
    id: 'DMZ_03_1513_M01',
    name: 'DMZ 03 -1513-M01',
    description: '',
    device: {
      id: 'DMZ_03_1513_M01',
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
      direction: 350,
    },
  },
  {
    id: 'DMZ_04_1514-M01',
    name: 'DMZ 04 -1514-M01',
    description: '',
    device: {
      id: 'DMZ_04_1514-M01',
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
      direction: 100,
    },
  },
  {
    id: 'DMZ_05_1515_M01',
    name: 'DMZ_05_1515_M01',
    description: '',
    device: {
      id: 'DMZ_05_1515_M01',
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
      direction: 180,
    },
  },
  {
    id: 'DMZ_06_1516_M01',
    name: 'DMZ_06_1516_M01',
    description: '',
    device: {
      id: 'DMZ_06_1516_M01',
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
      direction: 360,
    },
  },
  {
    id: '9',
    name: 'DMZ_07_1517_M01',
    description: '',
    device: {
      id: 'DMZ_07_1517_M01',
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
      direction: 90,
    },
  },
  {
    id: 'DMZ_08_1518_M01',
    name: 'DMZ_08_1518_M01',
    description: '',
    device: {
      id: 'DMZ_08_1518_M01',
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
      direction: 270,
    },
  },
  {
    id: 'DMZ_09_1519_M01',
    name: 'DMZ_09_1519_M01',
    description: '',
    device: {
      id: 'DMZ_09_1519_M01',
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
      direction: 150,
    },
  },
  {
    id: 'wlb-v1-123',
    name: 'Water Level Board V1',
    description: '',
    device: {
      id: 'wlb-v1-123',
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
      water_depth: 50,
    },
  },
  {
    id: 'wlb-v2-123',
    name: 'Water Level Board V2',
    description: '',
    device: {
      id: 'wlb-v2-123',
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
      water_depth: 150,
    },
  },
  {
    id: 'wlb-v3-123',
    name: 'Water Level Board V3',
    description: '',
    device: {
      id: 'wlb-v3-123',
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
      water_depth: 20,
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
      icon: 'https://cdn.app.com/icons/temperature.png',
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
      icon: 'https://cdn.app.com/icons/humidity.png',
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
      icon: 'https://cdn.app.com/icons/voltage.png',
    },
  ],
}

export const dummyGeofences = [
  {
    id: 'aa27e40c-4833-467c-ac65-0f2b923fba68',
    name: 'Danger zone',
    type_zone: 'danger',
    features: [
      {
        type: 'Polygon',
        properties: {
          id: 'ce954862-9ff6-41b5-9932-d4f11f0185a0',
          mode: 'circle',
          color: '#F27877',
          geofenceId: 'aa27e40c-4833-467c-ac65-0f2b923fba68',
        },
        coordinates: [
          [
            [108.164149476, 16.088890108],
            [108.163956395, 16.092666392],
            [108.163379011, 16.096406237],
            [108.162422885, 16.10007363],
            [108.161097225, 16.103633256],
            [108.159414797, 16.107050842],
            [108.157391805, 16.110293483],
            [108.155047731, 16.113329958],
            [108.152405149, 16.116131036],
            [108.149489509, 16.118669751],
            [108.146328891, 16.120921664],
            [108.142953732, 16.122865098],
            [108.139396538, 16.124481347],
            [108.135691566, 16.125754852],
            [108.131874497, 16.126673357],
            [108.127982091, 16.12722802],
            [108.124051835, 16.127413502],
            [108.120121579, 16.12722802],
            [108.116229173, 16.126673357],
            [108.112412104, 16.125754852],
            [108.108707132, 16.124481347],
            [108.105149938, 16.122865098],
            [108.101774779, 16.120921664],
            [108.098614161, 16.118669751],
            [108.095698521, 16.116131036],
            [108.093055939, 16.113329958],
            [108.090711865, 16.110293483],
            [108.088688873, 16.107050842],
            [108.087006445, 16.103633256],
            [108.085680785, 16.10007363],
            [108.084724659, 16.096406237],
            [108.084147275, 16.092666392],
            [108.083954194, 16.088890108],
            [108.084147275, 16.085113753],
            [108.084724659, 16.081373695],
            [108.085680785, 16.077705957],
            [108.087006445, 16.074145865],
            [108.088688873, 16.070727713],
            [108.090711865, 16.067484427],
            [108.093055939, 16.064447251],
            [108.095698521, 16.061645444],
            [108.098614161, 16.059106],
            [108.101774779, 16.056853386],
            [108.105149938, 16.054909306],
            [108.108707132, 16.053292491],
            [108.112412104, 16.052018521],
            [108.116229173, 16.051099672],
            [108.120121579, 16.050544796],
            [108.124051835, 16.050359241],
            [108.127982091, 16.050544796],
            [108.131874497, 16.051099672],
            [108.135691566, 16.052018521],
            [108.139396538, 16.053292491],
            [108.142953732, 16.054909306],
            [108.146328891, 16.056853386],
            [108.149489509, 16.059106],
            [108.152405149, 16.061645444],
            [108.155047731, 16.064447251],
            [108.157391805, 16.067484427],
            [108.159414797, 16.070727713],
            [108.161097225, 16.074145865],
            [108.162422885, 16.077705957],
            [108.163379011, 16.081373695],
            [108.163956395, 16.085113753],
            [108.164149476, 16.088890108],
          ],
        ],
      },
    ],
    color: 'F27877',
    event_rule: {
      event_rule_id: 'ddfb79b4-9c37-4db1-bd38-3f419ab514c0',
      rule_key: 'geofence',
      definition: {
        conditions: {
          and: [
            {
              and: [
                {
                  weekday_in: [3],
                },
                {
                  time_between: {
                    end: '18:00',
                    start: '00:00',
                  },
                },
              ],
            },
            {
              not: [
                {
                  and: [
                    {
                      weekday_in: [4],
                    },
                    {
                      time_between: {
                        end: '17:30',
                        start: '00:00',
                      },
                    },
                  ],
                },
              ],
            },
            {
              distance_from_geofence_km: {
                lte: 0.001,
              },
            },
          ],
        },
      },
      is_active: true,
      created_at: '2026-03-25T08:54:57.986003Z',
    },
    is_active: true,
    space_id: 'b52c57c2-b6b6-4221-aec2-ff11a43ada13',
    created_at: '2026-03-25T08:54:57.986003Z',
    updated_at: '2026-03-25T08:54:57.986003Z',
  },
  {
    id: 'c635dcc5-9f70-4e05-81c2-d42e977f0bf8',
    name: 'Safe zone',
    type_zone: 'safe',
    features: [
      {
        type: 'Polygon',
        properties: {
          id: '8c3c6e83-230e-4e7c-86d2-8222f37a7424',
          mode: 'circle',
          color: '#32BEB1',
          disabled: false,
          geofenceId: 'c635dcc5-9f70-4e05-81c2-d42e977f0bf8',
        },
        coordinates: [
          [
            [108.252810584, 16.012434008],
            [108.252778184, 16.013067928],
            [108.252681297, 16.013695742],
            [108.252520856, 16.014311402],
            [108.252298407, 16.01490898],
            [108.25201609, 16.015482721],
            [108.251676626, 16.016027101],
            [108.251283283, 16.016536875],
            [108.250839849, 16.017007136],
            [108.250350596, 16.017433355],
            [108.249820235, 16.017811427],
            [108.249253873, 16.018137712],
            [108.248656964, 16.018409067],
            [108.248035259, 16.01862288],
            [108.247394743, 16.018777091],
            [108.246741585, 16.018870216],
            [108.246082076, 16.018901357],
            [108.245422567, 16.018870216],
            [108.244769409, 16.018777091],
            [108.244128893, 16.01862288],
            [108.243507188, 16.018409067],
            [108.242910279, 16.018137712],
            [108.242343917, 16.017811427],
            [108.241813556, 16.017433355],
            [108.241324303, 16.017007136],
            [108.240880869, 16.016536875],
            [108.240487526, 16.016027101],
            [108.240148062, 16.015482721],
            [108.239865745, 16.01490898],
            [108.239643296, 16.014311402],
            [108.239482855, 16.013695742],
            [108.239385968, 16.013067928],
            [108.239353568, 16.012434008],
            [108.239385968, 16.011800086],
            [108.239482855, 16.011172266],
            [108.239643296, 16.010556596],
            [108.239865745, 16.009959005],
            [108.240148062, 16.009385248],
            [108.240487526, 16.008840851],
            [108.240880869, 16.008331056],
            [108.241324303, 16.007860775],
            [108.241813556, 16.007434536],
            [108.242343917, 16.007056444],
            [108.242910279, 16.006730141],
            [108.243507188, 16.00645877],
            [108.244128893, 16.006244944],
            [108.244769409, 16.006090723],
            [108.245422567, 16.005997593],
            [108.246082076, 16.005966449],
            [108.246741585, 16.005997593],
            [108.247394743, 16.006090723],
            [108.248035259, 16.006244944],
            [108.248656964, 16.00645877],
            [108.249253873, 16.006730141],
            [108.249820235, 16.007056444],
            [108.250350596, 16.007434536],
            [108.250839849, 16.007860775],
            [108.251283283, 16.008331056],
            [108.251676626, 16.008840851],
            [108.25201609, 16.009385248],
            [108.252298407, 16.009959005],
            [108.252520856, 16.010556596],
            [108.252681297, 16.011172266],
            [108.252778184, 16.011800086],
            [108.252810584, 16.012434008],
          ],
        ],
      },
      {
        type: 'Polygon',
        properties: {
          id: '1a564bde-69e2-414b-85d9-902ae287fba7',
          mode: 'rectangle',
          color: '#32BEB1',
          disabled: false,
          geofenceId: 'c635dcc5-9f70-4e05-81c2-d42e977f0bf8',
        },
        coordinates: [
          [
            [108.256393457, 16.010664957],
            [108.256393457, 15.99906299],
            [108.26691511, 15.99906299],
            [108.26691511, 16.010664957],
            [108.256393457, 16.010664957],
          ],
        ],
      },
    ],
    color: '32BEB1',
    event_rule: {
      event_rule_id: '627b94bb-c1d5-4114-8bbf-014a8480cc23',
      rule_key: 'geofence',
      definition: {
        conditions: {
          and: [
            {
              distance_from_geofence_km: {
                gte: 1,
              },
            },
          ],
        },
      },
      is_active: true,
      created_at: '2026-03-20T05:33:25.891456Z',
    },
    is_active: true,
    space_id: 'b52c57c2-b6b6-4221-aec2-ff11a43ada13',
    created_at: '2026-03-20T05:33:25.891456Z',
    updated_at: '2026-03-20T05:33:25.891456Z',
  },
  {
    id: 'f11fb578-54c4-4f6f-84d3-bf7f7ed22ea1',
    name: 'Warehouse perimeter',
    type_zone: 'danger',
    features: [
      {
        type: 'Polygon',
        properties: {
          id: '8b0ad935-4db8-4050-b648-3e393f968b0e',
          mode: 'rectangle',
          color: '#EF5A5A',
          disabled: false,
          geofenceId: 'f11fb578-54c4-4f6f-84d3-bf7f7ed22ea1',
        },
        coordinates: [
          [
            [108.1104, 16.0638],
            [108.1104, 16.0569],
            [108.1185, 16.0569],
            [108.1185, 16.0638],
            [108.1104, 16.0638],
          ],
        ],
      },
    ],
    color: 'EF5A5A',
    event_rule: {
      event_rule_id: 'c4ee87dc-d0d8-4b53-b8a6-f7f7ef3f1240',
      rule_key: 'geofence',
      definition: {
        conditions: {
          and: [
            {
              weekday_in: [1, 2, 3, 4, 5],
            },
            {
              time_between: {
                start: '20:00',
                end: '06:00',
              },
            },
            {
              distance_from_geofence_km: {
                lte: 0.005,
              },
            },
          ],
        },
      },
      is_active: true,
      created_at: '2026-03-22T10:00:00.000000Z',
    },
    is_active: true,
    space_id: 'b52c57c2-b6b6-4221-aec2-ff11a43ada13',
    created_at: '2026-03-22T10:00:00.000000Z',
    updated_at: '2026-03-24T09:00:00.000000Z',
  },
  {
    id: '7f6f126a-9348-4caf-b82f-8a830f1b3fb3',
    name: 'Office safe area',
    type_zone: 'safe',
    features: [
      {
        type: 'Polygon',
        properties: {
          id: 'f605905d-5303-471f-aafe-aa60bd9d0c54',
          mode: 'rectangle',
          color: '#2FC5B7',
          disabled: false,
          geofenceId: '7f6f126a-9348-4caf-b82f-8a830f1b3fb3',
        },
        coordinates: [
          [
            [108.2016, 16.0425],
            [108.2016, 16.0376],
            [108.2087, 16.0376],
            [108.2087, 16.0425],
            [108.2016, 16.0425],
          ],
        ],
      },
      {
        type: 'Polygon',
        properties: {
          id: '7df3ec8c-4686-48e5-9ad2-f683fd9acdb7',
          mode: 'rectangle',
          color: '#2FC5B7',
          disabled: false,
          geofenceId: '7f6f126a-9348-4caf-b82f-8a830f1b3fb3',
        },
        coordinates: [
          [
            [108.2111, 16.0459],
            [108.2111, 16.0417],
            [108.2162, 16.0417],
            [108.2162, 16.0459],
            [108.2111, 16.0459],
          ],
        ],
      },
    ],
    color: '2FC5B7',
    event_rule: {
      event_rule_id: 'b7178fc2-c473-4636-b67e-4adca56f0667',
      rule_key: 'geofence',
      definition: {
        conditions: {
          and: [
            {
              distance_from_geofence_km: {
                gte: 0.8,
              },
            },
          ],
        },
      },
      is_active: true,
      created_at: '2026-03-18T06:20:12.111111Z',
    },
    is_active: true,
    space_id: 'b52c57c2-b6b6-4221-aec2-ff11a43ada13',
    created_at: '2026-03-18T06:20:12.111111Z',
    updated_at: '2026-03-20T11:12:45.121212Z',
  },
  {
    id: 'a2a629c8-ef1e-4cfd-95f8-58f1f7298ece',
    name: 'School crossing watch',
    type_zone: 'danger',
    features: [
      {
        type: 'Polygon',
        properties: {
          id: '32f9f46f-b8d5-48b1-b019-ca89d8ce8589',
          mode: 'rectangle',
          color: '#F9A24E',
          disabled: false,
          geofenceId: 'a2a629c8-ef1e-4cfd-95f8-58f1f7298ece',
        },
        coordinates: [
          [
            [108.1828, 16.0734],
            [108.1828, 16.0698],
            [108.1879, 16.0698],
            [108.1879, 16.0734],
            [108.1828, 16.0734],
          ],
        ],
      },
    ],
    color: 'F9A24E',
    event_rule: {
      event_rule_id: 'bf20d885-6356-4ed1-b024-f0a4f8bcddf7',
      rule_key: 'geofence',
      definition: {
        conditions: {
          and: [
            {
              and: [
                {
                  weekday_in: [1, 2, 3, 4, 5],
                },
                {
                  time_between: {
                    start: '06:30',
                    end: '08:30',
                  },
                },
              ],
            },
            {
              distance_from_geofence_km: {
                lte: 0.002,
              },
            },
          ],
        },
      },
      is_active: true,
      created_at: '2026-03-10T03:00:00.000000Z',
    },
    is_active: true,
    space_id: 'b52c57c2-b6b6-4221-aec2-ff11a43ada13',
    created_at: '2026-03-10T03:00:00.000000Z',
    updated_at: '2026-03-21T14:09:31.000000Z',
  },
]

import { useDeviceStore } from '@/stores/device-store'
import {
  AmbientLight,
  LightingEffect,
  Material,
  PointLight,
} from '@deck.gl/core'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { Color, Position, ScenegraphLayer, TripsLayer } from 'deck.gl'
import { animate } from 'popmotion'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { realTimeLocations } from './dummy-locations'

const devices = [
  {
    name: 'Rak 2',
    id: '10',
    status: 'active',
    template: '456',
    type: 'rak',
    location: [108.223065, 16.067789],
    layerProps: {
      sizeScale: 200,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 90,
        roll: 90,
      },
    },
  },
  {
    name: 'Tracki 2',
    id: '11',
    status: 'active',
    battery: 90,
    type: 'tracki',
    location: [108.203089, 16.04329],
    layerProps: {
      sizeScale: 700,
      rotation: 'yaw',
      orientation: {
        pitch: 0,
        yaw: 360,
        roll: 180,
      },
    },
  },
]

const getCurrentLocation = (
  trip: Trip,
  currentTime: number
): Position | null => {
  const { path, timestamps } = trip

  // Ensure timestamps and path are valid
  if (!timestamps || !path || timestamps.length !== path.length) {
    // console.error(`Invalid data for trip with deviceId: ${trip.deviceId}`);
    return null
  }

  if (currentTime <= timestamps[0]) {
    return path[0]
  }

  if (currentTime >= timestamps[timestamps.length - 1]) {
    // Returns the last position if currentTime is after the last timestamp
    return path[path.length - 1]
  }

  // Use `findIndex` to locate the segment where the currentTime falls
  const segmentIndex = timestamps.findIndex(
    (t, i) => currentTime >= t && currentTime <= timestamps[i + 1]
  )

  if (segmentIndex === -1 || segmentIndex >= path.length - 1) {
    // Log if currentTime is outside the valid range
    // console.log(`Current time (${currentTime}) is out of range for trip: ${trip.deviceId}`);
    return null
  }

  // Compute linear interpolation for the segment
  const t1 = timestamps[segmentIndex]
  const t2 = timestamps[segmentIndex + 1]
  const p1 = path[segmentIndex]
  const p2 = path[segmentIndex + 1]

  const ratio = (currentTime - t1) / (t2 - t1)
  return [p1[0] + ratio * (p2[0] - p1[0]), p1[1] + ratio * (p2[1] - p1[1])]
}

const getDeviceLayer = (
  device: any,
  models: any,
  position?: [number, number]
) => {
  const model = models[device.type]
  const devicePosition = position ? position : device.location

  return new ScenegraphLayer({
    id: device.id,
    data: [{ position: [...(devicePosition as [number, number]), 20] }],
    scenegraph: model,
    getPosition: (d) => d.position,
    pickable: true,
    _lighting: 'pbr',
    ...(device.layerProps || {}),
    getOrientation: [
      device.layerProps.orientation.pitch,
      device.layerProps.orientation.yaw,
      device.layerProps.orientation.roll,
    ],
  })
}

// const data: Trip[] = [
//   {
//     timestamps: [0, 15, 30, 45, 60, 75, 90, 105],
//     vendor: 1,
//     deviceId: '10',
//     path: [
//       [108.223065, 16.067789], // Start near Dragon Bridge
//       [108.223492, 16.068198], // Move along Bach Dang Street
//       [108.224398, 16.068689], // Continue on Bach Dang
//       [108.225945, 16.070017], // Pass Han Market
//       [108.227567, 16.072003], // Near Da Nang Museum
//       [108.22938, 16.07345], // Towards Da Nang City Hall
//       [108.230583, 16.0739], // Da Nang Administrative Center
//       [108.2317, 16.075], // End at nearby park
//     ],
//   },
//   {
//     timestamps: [0, 20, 40, 60, 80, 100, 120, 140],
//     vendor: 2,
//     deviceId: '11',
//     path: [
//       [108.203089, 16.04329], // Start near My Khe Beach
//       [108.20449, 16.04412], // Walk towards Vo Nguyen Giap street
//       [108.20659, 16.0455], // Near Vinpearl Luxury Hotel
//       [108.20986, 16.04673], // Approaching East Sea Park
//       [108.21314, 16.04789], // Along Pham Van Dong Street
//       [108.2175, 16.05013], // Cross Han River Bridge
//       [108.22177, 16.05221], // Towards the city center
//       [108.223065, 16.067789], // End back at Dragon Bridge
//     ],
//   },
//   //   {
//   //     timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
//   //     vendor: 3,
//   //     path: [
//   //       [108.21178, 16.074728], // Start at Da Nang Train Station
//   //       [108.21259, 16.07387], // Move along Hai Phong Street
//   //       [108.2134, 16.0729], // Near Big C Supermarket
//   //       [108.21421, 16.07193], // Along Dien Bien Phu Street
//   //       [108.21502, 16.07097], // Near Con Market
//   //       [108.21583, 16.07], // Towards Phan Chu Trinh Street
//   //       [108.21664, 16.06905], // Near Nguyen Van Linh Street
//   //       [108.21745, 16.06809], // Approach Cham Museum
//   //       [108.21826, 16.06714], // Continue along Bach Dang Street
//   //       [108.223065, 16.067789], // End near Dragon Bridge
//   //     ],
//   //   },
// ]

export type Trip = {
  vendor: number
  path: Position[]
  timestamps: number[]
  deviceId: string
}

type Theme = {
  buildingColor: Color
  trailColor0: Color
  trailColor1: Color
  material: Material
  effects: [LightingEffect]
}

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
})

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
})

const lightingEffect = new LightingEffect({ ambientLight, pointLight })

const DEFAULT_THEME: Theme = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material: {
    ambient: 0.1,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [60, 64, 70],
  },
  effects: [lightingEffect],
}

export const useLoadTrip = () => {
  const { models } = useDeviceStore(
    useShallow((state) => ({
      models: state.models,
    }))
  )
  useEffect(() => {
    const animation = animate({
      from: 0,
      to: 1800,
      duration: (1800 * 60) / 0.8,
      repeat: Infinity,
      onUpdate: animationUpdate,
    })
    return () => animation.stop()
  }, [])

  const animationUpdate = (time: number) => {
    const locations = realTimeLocations.map((trip) => ({
      deviceId: trip.deviceId,
      location: getCurrentLocation(trip, time),
    }))

    //     locations: Array (1)
    // • 0:
    // deviceld: "11"
    // • location: Array (2)
    // 0: 108.22307683672547
    // 1: 16.067800337753425

    const deckLayers = (window.devicesHistoryOverlay as any)?._props.layers

    if (!deckLayers) return

    const newLayers = deckLayers.map((layer: any) => {
      const location = locations.find(
        (location) => location.deviceId === layer.id
      )?.location

      const device = devices.find((device) => device.id === layer.id)

      if (location) {
        return getDeviceLayer(device, models, location as any)
      }

      return createTripLayer(time)
    })

    window.devicesHistoryOverlay?.setProps({
      layers: newLayers,
    })
  }

  const createTripLayer = (time: number) => {
    return new TripsLayer<Trip>({
      id: 'trips',
      data: realTimeLocations,
      getPath: (d) => d.path,
      getTimestamps: (d) => d.timestamps,
      getColor: (d) =>
        d.vendor === 1 ? DEFAULT_THEME.trailColor0 : DEFAULT_THEME.trailColor1,
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength: 180,
      currentTime: time,
    })
  }

  const startLoadTrip = () => {
    const mapInstance = window.mapInstance
    const map = mapInstance.getMapInstance()

    const tripLayer = createTripLayer(0)

    const deviceLayers = devices.map((device) => getDeviceLayer(device, models))

    const deckOverlay = new MapboxOverlay({
      layers: [...deviceLayers, tripLayer],
      effects: DEFAULT_THEME.effects,
    })

    // window.devicesMapOverlay = deckOverlay

    window.devicesHistoryOverlay = deckOverlay

    map?.addControl(window.devicesHistoryOverlay)
  }

  return { startLoadTrip }
}

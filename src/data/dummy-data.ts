import { Device } from '@/stores/device-store'
import { TSpace } from '@/types/common'

export const spaceList: TSpace[] = [
  {
    id: '1',
    title: 'DF Space 1',
    count_device: 12,
    thumbnail: '',
  },
  {
    id: '2',
    title: 'DF Space 2',
    count_device: 13,
    thumbnail: '',
  },
  {
    id: '3',
    title: 'DF Space 3',
    count_device: 13,
    thumbnail: '',
  },
  {
    id: '4',
    title: 'DF Space 4',
    count_device: 13,
    thumbnail: '',
  },
]

export const devices: Device[] = [
  {
    name: 'Rak 1',
    id: '1',
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
  },

  {
    name: 'Rak 2',
    id: '2',
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
  },

  {
    name: 'Tracki 2',
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
  },

  // 15.509540258979442, 108.6785540886935
  {
    name: 'Tracki 2',
    id: '4',
    status: 'active',
    battery: 90,
    type: 'tracki',
    location: [108.6785540886935, 15.509540258979442],
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

  // 15.509969169714747, 108.67867759013264

  {
    name: 'Tracki 3',
    id: '5',
    status: 'active',
    battery: 90,
    type: 'tracki',
    location: [108.67867759013264, 15.509969169714747],
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

  {
    name: 'Rak 5',
    id: '6',
    status: 'active',
    template: '456',
    type: 'rak',
    location: [107.5406340057634, 16.474046857665563],
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

  // 16.511313632165106, 107.54960305263684
  {
    name: 'Rak 5',
    id: '7',
    status: 'active',
    template: '456',
    type: 'rak',
    location: [107.54960305263684, 16.511313632165106],
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
]

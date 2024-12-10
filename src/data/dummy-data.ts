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
      getOrientation: [0, 90, 90],
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
      getOrientation: [0, 90, 90],
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
      getOrientation: [0, 180, 90],
    },
  },
]

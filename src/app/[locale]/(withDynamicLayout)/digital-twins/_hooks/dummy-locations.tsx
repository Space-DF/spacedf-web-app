import { Trip } from './useLoadTrip'

export const realTimeLocations: Trip[] = [
  {
    timestamps: [0, 15, 30, 45, 60, 75, 90, 105],
    vendor: 1,
    deviceId: '10',
    path: [
      [108.223065, 16.067789], // Start near Dragon Bridge
      [108.223492, 16.068198], // Move along Bach Dang Street
      [108.224398, 16.068689], // Continue on Bach Dang
      [108.225945, 16.070017], // Pass Han Market
      [108.227567, 16.072003], // Near Da Nang Museum
      [108.22938, 16.07345], // Towards Da Nang City Hall
      [108.230583, 16.0739], // Da Nang Administrative Center
      [108.2317, 16.075], // End at nearby park
    ],
  },
  {
    timestamps: [0, 20, 40, 60, 80, 100, 120, 140],
    vendor: 2,
    deviceId: '11',
    path: [
      [108.22273310537767, 16.068085033664385],
      [108.2236547180086, 16.068057894823767],
      [108.22412249596016, 16.068358395082406],
      [108.22572085422449, 16.070031519714174],
      [108.22717097515141, 16.072379805773828],
      [108.22947351001879, 16.07318442704032],
      [108.2308487381987, 16.0738700395687],
      [108.2321842686452, 16.07548237837426],
    ],
  },
  //   {
  //     timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
  //     vendor: 3,
  //     path: [
  //       [108.21178, 16.074728], // Start at Da Nang Train Station
  //       [108.21259, 16.07387], // Move along Hai Phong Street
  //       [108.2134, 16.0729], // Near Big C Supermarket
  //       [108.21421, 16.07193], // Along Dien Bien Phu Street
  //       [108.21502, 16.07097], // Near Con Market
  //       [108.21583, 16.07], // Towards Phan Chu Trinh Street
  //       [108.21664, 16.06905], // Near Nguyen Van Linh Street
  //       [108.21745, 16.06809], // Approach Cham Museum
  //       [108.21826, 16.06714], // Continue along Bach Dang Street
  //       [108.223065, 16.067789], // End near Dragon Bridge
  //     ],
  //   },
]

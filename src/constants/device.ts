export type DeviceDataType = {
  id: number;
  coordinates: [number, number];
  info: string;
};

export const deviceDataTest: DeviceDataType[] = [
  { id: 1, coordinates: [105.83, 21.02], info: "Device 1" },
  { id: 2, coordinates: [105.84118, 21.0246], info: "Device 2" },
];

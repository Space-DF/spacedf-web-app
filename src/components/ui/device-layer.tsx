import type { DeviceDataType } from "@/constants/device";
import { SimpleMeshLayer } from "@deck.gl/mesh-layers";

const createDeviceLayer = (mesh: any | null, deviceData: DeviceDataType[]) => {
  if (!mesh) return null;

  return new SimpleMeshLayer<DeviceDataType>({
    id: "3d-device-layer",
    data: deviceData,
    mesh: mesh,
    sizeScale: 10,
    getPosition: (d: DeviceDataType) => d.coordinates,
    getColor: [255, 0, 0],
    getOrientation: [0, 0, 90],
    getScale: [1, 1, 1],
    pickable: true,
    onClick: (info) => alert(`Clicked on ${info.object.info}`),
  });
};

export { createDeviceLayer };

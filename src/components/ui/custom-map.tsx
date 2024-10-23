import React, { useState, useEffect } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { AmbientLight, DirectionalLight, LightingEffect } from "@deck.gl/core";
import { OBJLoader } from "@loaders.gl/obj";
import { load } from "@loaders.gl/core";
import { deviceDataTest } from "@/constants/device";
import { createDeviceLayer } from "./device-layer";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicGh1Y2xlZGYiLCJhIjoiY20xcHlmNjZlMDllZjJyb2R0bWludzdpaCJ9.Bqx6sdYilZx92ALh3GkhNQ";
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";
const INITIAL_VIEW_STATE = {
  longitude: 105.84117,
  latitude: 21.0245,
  zoom: 15,
  pitch: 45,
  bearing: 0,
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const directionalLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [-3, -9, -1],
});

const lightingEffect = new LightingEffect({ ambientLight, directionalLight });

const CustomMap = () => {
  const [mesh, setMesh] = useState<any>(null);

  useEffect(() => {
    const loadMesh = async () => {
      const objMesh = await load(
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj",
        OBJLoader
      );
      setMesh(objMesh);
    };
    loadMesh();
  }, []);

  const layers = [createDeviceLayer(mesh, deviceDataTest)];
  //We can add multiple layers to the map.

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      effects={[lightingEffect]}
    >
      <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_TOKEN} />
    </DeckGL>
  );
};

export default CustomMap;

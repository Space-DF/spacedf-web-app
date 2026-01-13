class WaterDepth3DLayerInstance {
  private static instance: WaterDepth3DLayerInstance | undefined

  private constructor() {}

  static getInstance() {
    if (!WaterDepth3DLayerInstance.instance) {
      WaterDepth3DLayerInstance.instance = new WaterDepth3DLayerInstance()
    }
    return WaterDepth3DLayerInstance.instance
  }
}

export { WaterDepth3DLayerInstance }

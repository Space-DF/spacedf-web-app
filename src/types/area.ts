export interface Area {
  id: string
  name: string
  description: string
  location: {
    latitude: number
    longitude: number
  }
  scene_asset: string
  type?: string
  url_scene_asset: string
}

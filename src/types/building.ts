export type Building = {
  id: string
  name: string
  description: string
  location: {
    latitude?: number
    longitude?: number
  }
  scene_asset?: string
  url_scene_asset?: string
}

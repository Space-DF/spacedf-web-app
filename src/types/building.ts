export type Building = {
  id: string
  name: string
  description: string
  location: {
    latitude?: number
    longitude?: number
  }
  type?: string
}

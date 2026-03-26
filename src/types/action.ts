export interface Action {
  created_at?: string
  data: {
    channel: string
    message: string
  }
  id: string
  name: string
  key: string
}

import { DeviceAttributes } from '../device-model'

type GpsTrackerAttributes = {
  location?: [number, number]
  description?: string
}

type SepcificModel<T = {}> = Partial<
  T & GpsTrackerAttributes & DeviceAttributes
>

//#region define type for sepcific attributes
type RakAttributes = {
  template?: string
}

type TrackiAttributes = {
  battery?: number
}

type WaterLevelAttributes = {
  waterLevel?: number
}
//#endregion define type for sepcific attributes

export type {
  TrackiAttributes,
  RakAttributes,
  SepcificModel,
  GpsTrackerAttributes,
  WaterLevelAttributes,
}

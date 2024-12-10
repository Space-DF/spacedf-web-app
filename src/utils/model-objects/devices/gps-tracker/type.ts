import { LngLatLike } from 'mapbox-gl'
import { DeviceAttributes } from '../device-model'

type SupportedModels = 'tracki' | 'rak'

type GpsTrackerAttributes = {
  location?: LngLatLike
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
//#endregion define type for sepcific attributes

export type {
  TrackiAttributes,
  RakAttributes,
  SepcificModel,
  GpsTrackerAttributes,
  SupportedModels,
}

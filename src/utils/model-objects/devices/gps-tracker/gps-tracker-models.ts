import { LngLatLike } from 'mapbox-gl'
import { DeviceAttributes, Device } from '../device-model'
import { RakAttributes, SepcificModel } from './type'

abstract class GpsTracker<
  TAttributes extends DeviceAttributes = DeviceAttributes,
> extends Device<TAttributes> {}

//#region tracker models
class Rak extends GpsTracker<SepcificModel<RakAttributes>> {}

class Tracki extends GpsTracker<SepcificModel<RakAttributes>> {}
//#endregion tracker models

export { Rak, Tracki }

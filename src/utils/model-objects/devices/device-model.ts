export type DeviceAttributes = {
  name?: string
}

export class Device<TAttributes extends DeviceAttributes = DeviceAttributes> {
  protected deviceAttributes: TAttributes = {
    name: '',
  } as TAttributes

  set attributes(attributes: TAttributes) {
    Object.assign(this.deviceAttributes, attributes)
  }

  get attributes(): TAttributes {
    return this.deviceAttributes
  }
}

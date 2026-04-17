import { EntityTelemetryData } from '@/lib/mqtt-handlers'

export const getWidgetRealtime = (widget: any, data: EntityTelemetryData) => {
  if (
    ['gauge', 'value', 'slider'].some((type) =>
      Array.isArray(widget.display_type)
        ? widget.display_type.includes(type)
        : widget.display_type === type
    )
  ) {
    return {
      ...widget,
      data: {
        value: data.entityUpdate.state,
        unit_of_measurement: data.entityUpdate.unit_of_measurement,
      },
    }
  }
  if (
    ['chart'].some((type) =>
      Array.isArray(widget.display_type)
        ? widget.display_type.includes(type)
        : widget.display_type === type
    )
  ) {
    return {
      ...widget,
      data: {
        data: [
          ...widget.data.data,
          {
            value: data.entityUpdate.state,
            timestamp: data.entityUpdate.timestamp,
          },
        ],
      },
    }
  }
  if (
    ['map'].some((type) =>
      Array.isArray(widget.display_type)
        ? widget.display_type.includes(type)
        : widget.display_type === type
    )
  ) {
    return {
      ...widget,
      data: {
        coordinate: {
          latitude: data.entityUpdate.attributes?.latitude,
          longitude: data.entityUpdate.attributes?.longitude,
        },
      },
    }
  }
  if (
    ['toggle', 'switch'].some((type) =>
      Array.isArray(widget.display_type)
        ? widget.display_type.includes(type)
        : widget.display_type === type
    )
  ) {
    return {
      ...widget,
      data: {
        value: data.entityUpdate.state,
      },
    }
  }
  return widget
}

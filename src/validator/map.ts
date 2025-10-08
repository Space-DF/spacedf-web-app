import { number, z } from 'zod'

export enum MapType {
  RoadMap = 'm',
  SatelLite = 'k',
}

export const mapSchema = z.object({
  sources: z.array(
    z.object({
      device_id: z.string().min(1, { message: 'Please select device' }),
      device_name: z.string().optional(),
      coordinate: z.array(number()),
      map_type: z.enum([MapType.RoadMap, MapType.SatelLite]),
    })
  ),
  widget_info: z.object({
    name: z
      .string()
      .min(1, { message: 'Please enter widget name' })
      .max(100, { message: 'Maximum 100 characters long!' }),
    appearance: z.object({
      show_value: z.boolean(),
    }),
  }),
})

export type mapPayload = z.infer<typeof mapSchema>
export type mapSource = z.infer<typeof mapSchema>['sources'][number]

export const defaultSourceMapValues: mapPayload['sources'] = [
  {
    device_id: '',
    coordinate: [16.05204105833857, 108.2168072245793],
    map_type: MapType.RoadMap,
  },
]

export const defaultMapValues: mapPayload = {
  sources: defaultSourceMapValues,
  widget_info: {
    name: 'New map widget',
    appearance: {
      show_value: true,
    },
  },
}

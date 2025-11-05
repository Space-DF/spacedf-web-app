import { z } from 'zod'

const sliderSourceSchema = z.object({
  device_id: z.string().min(1, 'Please select device'),
  field: z.string().min(1, 'Please select field'),
  min: z.number({ required_error: 'Please select min' }),
  max: z.number({ required_error: 'Please select max' }),
  step: z
    .number()
    .min(1, 'Step must be larger than 0')
    .max(100, 'Step must be smaller than 100'),
  unit: z.string().optional(),
})

export type SliderSource = z.infer<typeof sliderSourceSchema>

export const sliderSchema = z.object({
  value: z.number(),
  source: sliderSourceSchema,
  widget_info: z.object({
    name: z
      .string()
      .min(1, 'Widget name is required')
      .max(100, 'Maximum 100 characters long'),
    appearance: z.object({
      show_value: z.boolean(),
      show_state: z.boolean(),
    }),
  }),
})

export type SliderPayload = z.infer<typeof sliderSchema>

export const defaultSliderValues: SliderPayload = {
  value: 50,
  source: {
    device_id: '',
    field: '',
    min: 0,
    max: 100,
    step: 1,
    unit: '',
  },
  widget_info: {
    name: 'New Slider Widget',
    appearance: {
      show_value: true,
      show_state: true,
    },
  },
}

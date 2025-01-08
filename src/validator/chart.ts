import { ChartType } from '@/widget-models/chart'
import { z } from 'zod'

export const sourceChartSchema = z.object({
  sources: z.array(
    z.object({
      device_id: z.string().min(1, { message: 'Please select device' }),
      field: z.string().min(1, { message: 'Please select field' }),
      legend: z.string(),
      color: z.string(),
      show_legend: z.boolean(),
      chart_type: z.enum([
        ChartType.LineChart,
        ChartType.AreaChart,
        ChartType.BarChart,
      ]),
    }),
  ),
  widget_info: z.object({
    name: z
      .string()
      .min(1, { message: 'Please enter widget name' })
      .max(100, { message: 'Widget name is too long' }),
    appearance: z.object({
      show_value: z.boolean(),
    }),
  }),
})

export type SourceChartPayload = z.infer<typeof sourceChartSchema>

export const defaultSourceChartValues: SourceChartPayload['sources'] = [
  {
    device_id: '1',
    field: '1',
    legend: 'Temperature',
    color: '171A28',
    chart_type: ChartType.LineChart,
    show_legend: true,
  },
]

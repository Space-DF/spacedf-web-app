import { ChartType, Orientation } from '@/widget-models/chart'
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
      .max(100, { message: 'Maximum 100 characters long!' }),
    appearance: z.object({
      show_value: z.boolean(),
    }),
  }),
  axes: z.object({
    y_axis: z.object({
      orientation: z.enum([Orientation.Left, Orientation.Right]),
      unit: z.string().max(50, 'Maximum 50 characters').optional(),
    }),
    hide_axis: z.boolean(),
    is_show_grid: z.boolean(),
    format: z.string(),
  }),
})

export type SourceChartPayload = z.infer<typeof sourceChartSchema>

export const defaultSourceChartValues: SourceChartPayload['sources'] = [
  {
    device_id: '1',
    field: '1',
    legend: 'Temperature',
    color: 'default',
    chart_type: ChartType.LineChart,
    show_legend: true,
  },
]

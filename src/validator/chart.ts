import { ChartType } from '@/widget-models/chart'
import { z } from 'zod'

export const sourceChartSchema = z.object({
  sources: z.array(
    z.object({
      device_id: z.string({ required_error: 'dashboard.device_require_error' }),
      field: z.string({ required_error: 'dashboard.field_require_error' }),
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
})

export type SourceChartPayload = z.infer<typeof sourceChartSchema>

export const defaultSourceChartValues: SourceChartPayload['sources'] = [
  {
    device_id: '1',
    field: '1',
    legend: '',
    color: '32BEB1',
    chart_type: ChartType.LineChart,
    show_legend: false,
  },
]

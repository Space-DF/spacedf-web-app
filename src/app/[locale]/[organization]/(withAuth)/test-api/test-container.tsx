'use client'

import { Button } from '@/components/ui/button'
import React from 'react'
import { useGetWidgets } from './hooks/useGetWidget'
import { useCreateWidget } from './hooks/useCreateWidget'
import { v4 as uuidv4 } from 'uuid'
import { useUpdateWidgets } from './hooks/useUpdateWidgets'
import { useUpdateWidget } from './hooks/useUpdateWidget'
import { useDeleteWidget } from './hooks/useDeleteWidget'

const dataWidget = {
  sources: [
    {
      device_id: 'device123',
      field: 'temperature',
      legend: 'Temperature',
      color: '#FF5733',
      chart_type: 'line-chart',
      show_legend: true,
      device_type: 'gps',
    },
    {
      device_id: 'device124',
      field: 'temperature',
      legend: 'Temperature',
      color: '#FF5733',
      chart_type: 'area-chart',
      show_legend: true,
      device_type: 'gps',
    },
  ],
  axes: {
    y_axis: {
      orientation: 'left',
      unit: '°C',
    },
    is_show_grid: true,
    format: '0.0',
    hide_axis: false,
  },
  time_frame: {
    from: '2025-01-01T00:00:00Z',
    until: '2025-01-07T23:59:59Z',
    resolution: 60,
    resolution_unit: 'minutes',
    time_zone: 'UTC',
    aggregation_function: 'average',
  },
  widget_info: {
    id: 'widget001',
    name: 'Temperature Chart',
    description: 'Displays temperature trends over time.',
  },
  widget_type: 'chart',
}

export const TestContainer = () => {
  const { data } = useGetWidgets()
  const { createWidget } = useCreateWidget()
  const { updateWidgets } = useUpdateWidgets()
  const { updateWidget } = useUpdateWidget()
  const { deleteWidget } = useDeleteWidget()

  return (
    <div className="flex gap-5">
      <Button>GET</Button>
      <Button
        onClick={() => {
          const newId = uuidv4()
          createWidget({
            ...dataWidget,
            id: newId,
          })
        }}
      >
        Create
      </Button>

      <Button
        onClick={() => {
          //   const newId = uuidv4()
          const newData = (data || []).map((widget, index) =>
            index === 0 ? { ...widget, sources: [] } : widget
          )

          updateWidgets(newData)
        }}
      >
        Update All Widgets
      </Button>

      <Button
        onClick={() => {
          const itemUpdate = data?.[0]

          updateWidget({
            widgetId: itemUpdate?.id || '',
            dataUpdated: {
              ...itemUpdate,
              sources: [],
            },
          })
        }}
      >
        Update Widget Item
      </Button>

      <Button
        onClick={() => {
          const itemUpdate = data?.[0]
          deleteWidget({
            widgetId: itemUpdate?.id || '',
          })
        }}
      >
        Delete
      </Button>
    </div>
  )
}

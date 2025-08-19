'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'
import { useMounted } from '@/hooks'
import { useScreenLayoutStore } from '@/stores/dashboard-layout'
import GridLayout from '../grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Widget } from '@/types/widget'
import { getWidgetByType } from './utils'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

const columnsLayout: Record<string, number> = {
  lg: 18,
  md: 16,
  sm: 13,
  xs: 8,
  xxs: 6,
}

interface Props {
  isEdit?: boolean
  widgets: Widget[]
}

export const MockData: React.FC<Props> = ({ isEdit, widgets }) => {
  const { mounted } = useMounted()
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('')
  const { layouts, setLayouts } = useScreenLayoutStore((state) => ({
    layouts: state.layouts,
    setLayouts: state.setLayouts,
  }))

  const handleLayoutChange = (_: Layout[], layouts: Layouts) => {
    setLayouts(layouts)
  }
  const handleBreakpointChange = (newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint)
  }

  return (
    <div
      className={cn(isEdit ? 'pb-44' : 'pb-32', 'relative')}
      id="dashboard-container"
    >
      {isEdit && (
        <GridLayout
          margin={5}
          rowHeight={60}
          columns={columnsLayout[currentBreakpoint]}
        />
      )}
      <ResponsiveReactGridLayout
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 18, md: 16, sm: 13, xs: 8, xxs: 6 }}
        rowHeight={60}
        margin={[5, 5]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        measureBeforeMount={false}
        useCSSTransforms={mounted}
        compactType="vertical"
        onBreakpointChange={handleBreakpointChange}
        preventCollision={false}
        isDraggable={isEdit}
        isResizable={isEdit}
      >
        {widgets.map((widget) => {
          return getWidgetByType(widget)
        })}
      </ResponsiveReactGridLayout>
    </div>
  )
}

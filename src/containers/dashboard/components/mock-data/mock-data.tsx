'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'
import { useMounted } from '@/hooks'
import { useScreenLayoutStore } from '@/stores/dashboard-layout'
import GridLayout from '../grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Widget, WidgetLayout } from '@/types/widget'
import { getWidgetByType } from './utils'
import { useShallow } from 'zustand/react/shallow'
import { useDashboardStore } from '@/stores/dashboard-store'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useTranslations } from 'next-intl'
import { useDeleteWidget } from '../widget-list/hooks/useDeleteWidget'
import { toast } from 'sonner'

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
  onChangeWidgets: (widgets: any[]) => void
  onDeleteSuccess: () => void
  onEditWidget: (layout: WidgetLayout) => void
}

export const MockData: React.FC<Props> = ({
  isEdit,
  widgets,
  onChangeWidgets,
  onDeleteSuccess,
  onEditWidget,
}) => {
  const { mounted } = useMounted()
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>()
  const layouts = useScreenLayoutStore(useShallow((state) => state.layouts))
  const setLayouts = useScreenLayoutStore((state) => state.setLayouts)
  const t = useTranslations('dashboard')
  const { trigger: deleteWidget, isMutating: isDeletingWidget } =
    useDeleteWidget()

  const handleLayoutChange = (layout: Layout[], layouts: Layouts) => {
    onChangeWidgets(layout)
    setLayouts(layouts)
  }
  const widgetList = useDashboardStore(useShallow((state) => state.widgetList))

  const handleBreakpointChange = (newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint)
  }

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    await deleteWidget(
      { widgetId: pendingDeleteId },
      {
        onSuccess: () => {
          toast.success(t('widget_deleted_successfully'))
          onDeleteSuccess?.()
        },
        onError: () => {
          toast.error(t('widget_delete_failed'))
        },
      }
    )
    setPendingDeleteId(undefined)
  }

  const handleCancelDelete = () => {
    setPendingDeleteId(undefined)
  }

  return (
    <>
      <ConfirmDialog
        open={!!pendingDeleteId}
        title={t('delete_widget_confirm_title')}
        description={t('delete_widget_confirm_description')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        destructive
        isConfirming={isDeletingWidget}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
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
          className="my-grid"
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
          draggableCancel=".dashboard-widget-toolbar"
        >
          {widgets.map((widget, index) => {
            return getWidgetByType(
              widget,
              widgetList[index],
              handleDeleteRequest,
              onEditWidget,
              isEdit
            )
          })}
        </ResponsiveReactGridLayout>
      </div>
    </>
  )
}

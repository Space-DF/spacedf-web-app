'use client'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { RightSideBarLayout } from '@/components/ui'
import { getNewLayouts, useLayout } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { COOKIES, NavigationEnums } from '@/constants'
import { setCookie } from '@/utils'
import WidgetSelection from './components/widget-selection'
import WidgetSelected from './components/widget-selected'
import { WidgetType } from '@/widget-models/widget'
import { useGetWidgets } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/test-api/hooks/useGetWidget'
import { WidgetList } from './components/widget-list'
import { WidgetLayout } from '@/types/widget'

const WIDGET_TYPES_WITH_DETAIL_EDITOR: WidgetType[] = Object.values(WidgetType)

const Dashboard = () => {
  const t = useTranslations()
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<WidgetType | ''>('')
  const [editingWidgetLayout, setEditingWidgetLayout] =
    useState<WidgetLayout | null>(null)

  const toggleDynamicLayout = useLayout((state) => state.toggleDynamicLayout)
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const setCookieDirty = useLayout((state) => state.setCookieDirty)

  const { setEdit, dashboard, setWidgetList } = useDashboardStore(
    useShallow((state) => ({
      setEdit: state.setEdit,
      dashboard: state.dashboard,
      setWidgetList: state.setWidgetList,
    }))
  )

  const { data: widgetLayout, mutate: mutateWidgets } = useGetWidgets(
    dashboard?.id
  )

  const dashboardId = dashboard?.id

  useEffect(() => {
    if (!dashboardId) {
      setWidgetList([])
      return
    }
    if (widgetLayout) {
      setWidgetList(widgetLayout)
    }
  }, [widgetLayout, dashboardId])

  const onSelectWidget = (widgetTitle: WidgetType) => {
    setSelectedWidget(widgetTitle)
  }
  const onCloseSideBar = useCallback(() => {
    const newLayout = getNewLayouts(dynamicLayouts, NavigationEnums.DASHBOARD)
    setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
    setIsAddWidgetOpen(false)
    setEdit(false)
    setCookieDirty(true)
    toggleDynamicLayout('dashboard')
    setSelectedWidget('')
    setEditingWidgetLayout(null)
  }, [])

  const onSaveWidget = useCallback(() => {
    setIsAddWidgetOpen(false)
    setEdit(true)
    setSelectedWidget('')
    setEditingWidgetLayout(null)
    mutateWidgets()
  }, [])

  const onEditWidget = useCallback((layout: WidgetLayout) => {
    const widgetType = layout.configuration?.type as WidgetType | undefined
    if (!widgetType || !WIDGET_TYPES_WITH_DETAIL_EDITOR.includes(widgetType)) {
      return
    }
    setEditingWidgetLayout(layout)
    setSelectedWidget(widgetType)
    setIsAddWidgetOpen(true)
  }, [])

  const handleGoBack = useCallback(() => {
    if (editingWidgetLayout) {
      setEditingWidgetLayout(null)
      setIsAddWidgetOpen(false)
    }
    setSelectedWidget('')
    setEditingWidgetLayout(null)
  }, [])

  return (
    <>
      {!isAddWidgetOpen ? (
        <WidgetList
          onCloseSideBar={onCloseSideBar}
          setIsAddWidgetOpen={setIsAddWidgetOpen}
          mutateWidgets={mutateWidgets}
          onEditWidget={onEditWidget}
        />
      ) : selectedWidget ? (
        <WidgetSelected
          selectedWidget={selectedWidget}
          editingWidgetLayout={editingWidgetLayout}
          onClose={onCloseSideBar}
          onBack={handleGoBack}
          onSaveWidget={onSaveWidget}
        />
      ) : (
        <RightSideBarLayout
          onClose={onCloseSideBar}
          contentClassName="overflow-hidden px-2"
          title={
            <div className="flex size-full items-center gap-2">
              <ArrowLeft
                size={20}
                onClick={() => {
                  if (selectedWidget) {
                    setSelectedWidget('')
                  }
                  setEditingWidgetLayout(null)
                  setIsAddWidgetOpen(false)
                }}
                className="cursor-pointer"
              />
              <div>{t('dashboard.add_widget')}</div>
            </div>
          }
        >
          <div className="mt-6 size-full">
            <WidgetSelection onSelectWidget={onSelectWidget} />
          </div>
        </RightSideBarLayout>
      )}
    </>
  )
}

export default memo(Dashboard)

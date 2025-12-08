'use client'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { RightSideBarLayout } from '@/components/ui'
import { getNewLayouts, useLayout } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { COOKIES, NavigationEnums } from '@/constants'
import { setCookie } from '@/utils'
import WidgetSelection from './components/widget-selection'
import WidgetSelected from './components/widget-selected'
import { WidgetType } from '@/widget-models/widget'
import { useGetWidgets } from '@/app/[locale]/[organization]/(withAuth)/test-api/hooks/useGetWidget'
import { WidgetList } from './components/widget-list'

const Dashboard = () => {
  const t = useTranslations()
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<WidgetType | ''>('')

  const toggleDynamicLayout = useLayout((state) => state.toggleDynamicLayout)
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const setCookieDirty = useLayout((state) => state.setCookieDirty)

  const { setEdit, dashboardId } = useDashboardStore()

  const { data: widgetLayout, mutate: mutateWidgets } =
    useGetWidgets(dashboardId)

  const onSelectWidget = (widgetTitle: WidgetType) => {
    setSelectedWidget(widgetTitle)
  }
  const onCloseSideBar = () => {
    const newLayout = getNewLayouts(dynamicLayouts, NavigationEnums.DASHBOARD)
    setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
    setIsAddWidgetOpen(false)
    setEdit(false)
    setCookieDirty(true)
    toggleDynamicLayout('dashboard')
    setSelectedWidget('')
  }

  const onSaveWidget = () => {
    setIsAddWidgetOpen(false)
    setEdit(true)
    setSelectedWidget('')
    mutateWidgets()
  }

  return (
    <>
      {!isAddWidgetOpen ? (
        <WidgetList
          onCloseSideBar={onCloseSideBar}
          setIsAddWidgetOpen={setIsAddWidgetOpen}
          widgetLayouts={widgetLayout || []}
        />
      ) : selectedWidget ? (
        <WidgetSelected
          selectedWidget={selectedWidget}
          onClose={onCloseSideBar}
          onBack={() => setSelectedWidget('')}
          onSaveWidget={onSaveWidget}
        />
      ) : (
        <RightSideBarLayout
          onClose={onCloseSideBar}
          contentClassName="overflow-hidden"
          title={
            <div className="flex size-full items-center gap-2">
              <ArrowLeft
                size={20}
                onClick={() => {
                  if (selectedWidget) {
                    setSelectedWidget('')
                  }
                  setIsAddWidgetOpen(false)
                }}
                className="cursor-pointer"
              />
              <div>{t('dashboard.add_widget')}</div>
            </div>
          }
        >
          <div className="mt-6 size-full px-4">
            <WidgetSelection onSelectWidget={onSelectWidget} />
          </div>
        </RightSideBarLayout>
      )}
    </>
  )
}

export default memo(Dashboard)

import { Nodata, RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Grid2x2Plus } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { WidgetLayout } from '@/types/widget'
import { useScreenLayoutStore } from '@/stores/dashboard-layout'
import { MockData } from '../mock-data/mock-data'
import { useDeleteDashboard } from '../../hooks/useDeleteDashboard'
import { useDashboard } from '../../hooks/useDashboard'
import { useUpdateWidgets } from './hooks/useUpdateWidgets'
import { toast } from 'sonner'
import { WidgetAction } from './components/widget-action'
import { useShallow } from 'zustand/react/shallow'
import { useDebounce } from '@/hooks/useDebounce'
import { Dashboard } from '@/types/dashboard'
import { sleep } from '@/utils'
import { useGlobalStore } from '@/stores'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getLayouts } from './utils'
import { ConfirmDeleteDashboard } from './components/delete-dialog'
import { DashboardList } from './components/dashboard-list'

const DashboardTable = dynamic(() => import('./components/dashboard-table'), {
  ssr: false,
})

const DashboardDialog = dynamic(
  () => import('./components/dashboard-dialog').then((m) => m.DashboardDialog),
  { ssr: false }
)

interface Props {
  onCloseSideBar: () => void
  setIsAddWidgetOpen: (open: boolean) => void
  mutateWidgets: () => void
  onEditWidget: (layout: WidgetLayout) => void
}

export const WidgetList: React.FC<Props> = ({
  onCloseSideBar,
  setIsAddWidgetOpen,
  mutateWidgets,
  onEditWidget,
}) => {
  const {
    isViewAllDashboard,
    setViewAllDashboard,
    deleteId,
    setDeleteId,
    isEdit,
    setEdit,
    dashboard,
    setDashboard,
  } = useDashboardStore(
    useShallow((state) => ({
      isViewAllDashboard: state.isViewAllDashboard,
      setViewAllDashboard: state.setViewAllDashboard,
      deleteId: state.deleteId,
      setDeleteId: state.setDeleteId,
      isEdit: state.isEdit,
      setEdit: state.setEdit,
      dashboard: state.dashboard,
      setDashboard: state.setDashboard,
    }))
  )

  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const { trigger: updateWidgets, isMutating: isUpdatingWidgets } =
    useUpdateWidgets()
  const [isOpenDashboardDialog, setIsOpenDashboardDialog] = useState(false)
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard>()
  const [widgets, setWidgets] = useState<any[]>([])
  const handleChangeWidgets = useCallback((widgets: any[]) => {
    setWidgets(widgets)
  }, [])

  const widgetList = useDashboardStore(useShallow((state) => state.widgetList))
  const [searchDashboard, setSearchDashboard] = useState('')
  const searchDashboardDebounced = useDebounce(searchDashboard, 300)
  const {
    data: dashboardList,
    refetch,
    isLoading: isLoadingDashboard,
  } = useDashboard(searchDashboardDebounced)
  const { trigger: deleteDashboard, isMutating: isDeleting } =
    useDeleteDashboard(deleteId)

  const dashboards = useMemo(() => dashboardList || [], [dashboardList])

  const handleDeleteDashboard = async () => {
    await deleteDashboard()
    await refetch()
    if (dashboard?.id === deleteId) {
      setDashboard(undefined)
    }
    setDeleteId(undefined)
  }

  const currentWidgetLayout = useMemo(() => {
    return (
      widgetList.map((widget) => ({
        ...widget.configuration,
        widgetId: widget.id,
      })) || []
    )
  }, [widgetList])

  useEffect(() => {
    setWidgets(currentWidgetLayout)
  }, [currentWidgetLayout])

  const setLayouts = useScreenLayoutStore((state) => state.setLayouts)

  const handleCancelEdit = () => {
    if (currentWidgetLayout.length) {
      setLayouts(getLayouts(currentWidgetLayout))
    }
    setEdit(false)
  }

  const handleSaveDashboard = async () => {
    const currentWidgetPayload = widgetList.map((widgetLayout, index) => ({
      id: widgetLayout.id,
      configuration: { ...widgetLayout.configuration, ...widgets[index] },
    }))
    updateWidgets(currentWidgetPayload, {
      onSuccess: () => {
        setEdit(false)
        toast.success(t('dashboard.widgets_updated_successfully'))
        mutateWidgets()
      },
      onError: () => {
        toast.error(t('dashboard.widgets_update_failed'))
      },
    })
  }

  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name

  const handleViewAllDashboard = () => {
    setOpen(false)
    setViewAllDashboard(true)
  }

  useEffect(() => {
    if (!!currentWidgetLayout.length) {
      setLayouts(getLayouts(currentWidgetLayout))
    }
  }, [currentWidgetLayout])

  useEffect(() => {
    if (!dashboards.length && !isLoadingDashboard) {
      setDashboard(undefined)
      return
    }
    if (dashboards.length > 0 && !dashboard) {
      setDashboard(dashboards[0])
      return
    }
  }, [dashboards, dashboard, spaceSlugName, isLoadingDashboard])

  const handleOpenChangeDashboard = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setSearchDashboard('')
    }
  }

  const handleSelectDashboard = useCallback((dashboard: Dashboard) => {
    setSelectedDashboard(dashboard)
    setIsOpenDashboardDialog(true)
  }, [])

  const handleCloseDashboardDialog = async () => {
    setOpen(false)
    setIsOpenDashboardDialog(false)
    await sleep(300)
    setSelectedDashboard(undefined)
  }

  return (
    <>
      <DashboardDialog
        isOpen={isOpenDashboardDialog}
        setDashboard={setDashboard}
        closePopover={handleCloseDashboardDialog}
        setIsOpen={setIsOpenDashboardDialog}
        selectedDashboard={selectedDashboard}
      />
      <RightSideBarLayout
        onClose={onCloseSideBar}
        title={
          isViewAllDashboard ? (
            <div className="flex items-center gap-2">
              <ArrowLeft
                size={20}
                onClick={() => setViewAllDashboard(false)}
                className="cursor-pointer"
              />
              <div>{t('dashboard.all_dashboard')}</div>
            </div>
          ) : (
            <DashboardList
              searchDashboard={searchDashboard}
              setSearchDashboard={setSearchDashboard}
              open={open}
              onOpenDashboardChange={handleOpenChangeDashboard}
              dashboards={dashboards}
              isLoadingDashboard={isLoadingDashboard}
              onViewAllDashboard={handleViewAllDashboard}
              setIsOpenDashboardDialog={setIsOpenDashboardDialog}
            />
          )
        }
        externalButton={
          <WidgetAction
            isViewAllDashboard={isViewAllDashboard}
            isEdit={isEdit}
            handleCancelEdit={handleCancelEdit}
            handleSaveDashboard={handleSaveDashboard}
            isUpdatingWidgets={isUpdatingWidgets}
            setEdit={setEdit}
            dashboard={dashboard}
          />
        }
      >
        <div className="mt-4">
          {isViewAllDashboard ? (
            <DashboardTable onSelectDashboard={handleSelectDashboard} />
          ) : (
            <>
              {isEdit && (
                <div className="mb-6 flex flex-col items-center gap-3">
                  <Button
                    className="h-12 w-full items-center gap-2"
                    onClick={() => setIsAddWidgetOpen(true)}
                  >
                    {t('dashboard.add_widget')}
                    <Grid2x2Plus size={16} />
                  </Button>
                </div>
              )}
              {!widgetList.length && <Nodata content={t('common.no_widget')} />}
              <MockData
                isEdit={isEdit}
                widgets={currentWidgetLayout}
                onChangeWidgets={handleChangeWidgets}
                onDeleteSuccess={mutateWidgets}
                onEditWidget={onEditWidget}
              />
            </>
          )}
        </div>
        <ConfirmDeleteDashboard
          deleteId={deleteId}
          setDeleteId={setDeleteId}
          isDeleting={isDeleting}
          onDeleteDashboard={handleDeleteDashboard}
        />
      </RightSideBarLayout>
    </>
  )
}

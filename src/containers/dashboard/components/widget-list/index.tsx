import { Nodata, RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronsUpDown,
  Grid2x2Plus,
  PlusIcon,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useTranslations } from 'next-intl'
import { Separator } from '@/components/ui/separator'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Widget } from '@/types/widget'
import { useScreenLayoutStore } from '@/stores/dashboard-layout'
import { DataTable } from '@/components/ui/data-table'
import { MockData } from '../mock-data/mock-data'
import { getColumns } from '../../column'
import { useDeleteDashboard } from '../../hooks/useDeleteDashboard'
import { useDashboard } from '../../hooks/useDashboard'
import { useUpdateWidgets } from './hooks/useUpdateWidgets'
import { toast } from 'sonner'
import { WidgetAction } from './components/widget-action'
import { DashboardDialog } from './components/dashboard-dialog'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useIdentityStore } from '@/stores/identity-store'
import { Dashboard } from '@/types/dashboard'
import { sleep } from '@/utils'
import { useShallow } from 'zustand/react/shallow'

interface Props {
  onCloseSideBar: () => void
  setIsAddWidgetOpen: (open: boolean) => void
  mutateWidgets: () => void
}

const getLayouts = (widgets: Widget[]) => {
  const layout = widgets.map((widget) => ({ ...widget, i: widget.id }))
  return {
    sm: layout,
    md: layout,
    lg: layout,
    xs: layout,
    xxs: layout,
  }
}

export const WidgetList: React.FC<Props> = ({
  onCloseSideBar,
  setIsAddWidgetOpen,
  mutateWidgets,
}) => {
  const {
    isViewAllDashboard,
    setViewAllDashboard,
    deleteId,
    setDeleteId,
    isEdit,
    setEdit,
    dashboardId,
    setDashboardId,
  } = useDashboardStore()
  const t = useTranslations()
  const setOpenDrawerIdentity = useIdentityStore(
    (state) => state.setOpenDrawerIdentity
  )
  const [open, setOpen] = useState(false)
  const isAuthenticated = useAuthenticated()
  const { trigger: updateWidgets, isMutating: isUpdatingWidgets } =
    useUpdateWidgets()
  const [isOpenDashboardDialog, setIsOpenDashboardDialog] = useState(false)
  const [widgets, setWidgets] = useState<any[]>([])
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard>()
  const handleChangeWidgets = useCallback((widgets: any[]) => {
    setWidgets(widgets)
  }, [])

  const widgetList = useDashboardStore(useShallow((state) => state.widgetList))

  const { data: dashboards = [], mutate } = useDashboard()

  const { trigger: deleteDashboard, isMutating: isDeleting } =
    useDeleteDashboard(deleteId)

  const handleDeleteDashboard = async () => {
    await deleteDashboard()
    await mutate()
    setDeleteId(undefined)
  }

  const currentWidgetLayout = useMemo(() => {
    const widgets = widgetList.map((widget) => widget.configuration) || []
    setWidgets(widgets)
    return widgets
  }, [widgetList])

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

  const handleDeleteSpace = (id: string) => {
    setDeleteId(id)
  }

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
    if (dashboards.length > 0 && !dashboardId) {
      setDashboardId(dashboards[0].id)
      return
    }
    if (dashboardId && !dashboards.length) {
      setDashboardId(undefined)
      return
    }
  }, [dashboards, dashboardId])

  const currentDashboardName = useMemo(() => {
    if (dashboardId) {
      const dashboard = dashboards.find(
        (dashboard) => dashboard.id === dashboardId
      )
      return dashboard?.name || 'Select Dashboard'
    }
    return 'Select Dashboard'
  }, [dashboardId, dashboards])

  const handleOpenDashboardDialog = () => {
    if (isAuthenticated) {
      setIsOpenDashboardDialog(true)
    } else {
      setOpenDrawerIdentity(true)
    }
  }

  const handleCloseDashboardDialog = async () => {
    setOpen(false)
    setIsOpenDashboardDialog(false)
    await sleep(300)
    setSelectedDashboard(undefined)
  }

  const handleSelectDashboard = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard)
    setIsOpenDashboardDialog(true)
  }

  const columns = useMemo(() => {
    return getColumns({ handleDeleteSpace, t, handleSelectDashboard })
  }, [t])

  return (
    <>
      <DashboardDialog
        isOpen={isOpenDashboardDialog}
        setDashboardId={setDashboardId}
        closePopover={handleCloseDashboardDialog}
        setIsOpen={setIsOpenDashboardDialog}
        dashboard={selectedDashboard}
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
            <Popover
              open={open}
              onOpenChange={(open) => {
                setOpen(open)
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'line-clamp-1 border-none flex h-8 justify-between gap-2 whitespace-normal px-2 py-1 text-brand-component-text-dark bg-brand-component-fill-dark-soft dark:bg-brand-background-fill-surface',
                    {
                      'border-brand-component-stroke-dark shadow-dashboard':
                        open,
                    }
                  )}
                >
                  <div className="line-clamp-1 w-full flex-1 text-left">
                    {currentDashboardName}
                  </div>
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 rounded-lg p-2" align="start">
                <Command>
                  <CommandInput
                    classNameContainer="border-0 rounded-lg bg-brand-fill-dark-soft"
                    placeholder={t('dashboard.search')}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {t('dashboard.no_dashboard_found')}
                    </CommandEmpty>
                    <CommandGroup className="mt-3 p-0">
                      {dashboards.map((dashboard) => (
                        <CommandItem
                          key={dashboard.id}
                          value={dashboard.id}
                          onSelect={(currentValue) => {
                            const itemSelect = dashboards.find(
                              (dashboard) => dashboard.id === currentValue
                            )
                            setDashboardId(itemSelect!.id)
                            setOpen(false)
                            setEdit(false)
                          }}
                          className={cn(
                            'cursor-pointer rounded-md hover:bg-brand-fill-dark-soft dark:hover:bg-brand-fill-outermost',
                            {
                              'bg-brand-fill-dark-soft dark:bg-brand-fill-outermost':
                                dashboardId === dashboard.id,
                            }
                          )}
                        >
                          {dashboard.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <Separator className="my-3" />
                    <Button
                      className="mb-3 h-8 w-full gap-2 rounded-lg text-sm font-semibold text-brand-text-gray"
                      variant="outline"
                      onClick={handleViewAllDashboard}
                    >
                      {t('dashboard.view_all_dashboard')}
                      <ArrowUpRight />
                    </Button>

                    <Button
                      className="h-8 w-full gap-2 rounded-lg text-sm font-semibold"
                      onClick={handleOpenDashboardDialog}
                    >
                      {t('dashboard.create_new_dashboard')}
                      <PlusIcon size={16} />
                    </Button>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
            dashboardId={dashboardId}
          />
        }
      >
        <div className="mt-4">
          {isViewAllDashboard ? (
            <DataTable columns={columns} data={dashboards} />
          ) : (
            <>
              {isEdit && (
                <div className="mb-6 flex flex-col items-center gap-3">
                  <Button
                    className="h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark font-semibold text-white dark:border-brand-component-stroke-light"
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
              />
            </>
          )}
        </div>
        <AlertDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(undefined)}
        >
          <AlertDialogContent className="dark:bg-brand-component-fill-outermost p-4 sm:max-w-[402px] sm:rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-lg font-bold text-brand-component-text-dark">
                {t('dashboard.are_you_sure')}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm font-medium text-brand-component-text-gray">
                {t(
                  'dashboard.the_dashboard_will_be_deleted_from_the_system_and_cannot_be_restored'
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-4">
              <AlertDialogCancel className="h-12 flex-1 border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none">
                {t('dashboard.cancel')}
              </AlertDialogCancel>
              <Button
                loading={isDeleting}
                className="h-12 flex-1 items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-component-fill-negative hover:opacity-70 dark:border-brand-component-stroke-light"
                onClick={handleDeleteDashboard}
              >
                {t('dashboard.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </RightSideBarLayout>
    </>
  )
}

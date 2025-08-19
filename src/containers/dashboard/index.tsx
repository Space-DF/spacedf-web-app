'use client'
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronsUpDown,
  Grid2x2Plus,
  Pencil,
  PlusIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Nodata } from '@/components/ui/no-data'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getNewLayouts, useLayout } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { DataTable } from '@/components/ui/data-table'
import { getColumns } from '@/containers/dashboard/column'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { MockData } from '@/containers/dashboard/components/mock-data/mock-data'
import { COOKIES, NavigationEnums } from '@/constants'
import { setCookie } from '@/utils'
import WidgetSelection from './components/widget-selection'
import WidgetSelected from './components/widget-selected'
import { WidgetType } from '@/widget-models/widget'
// import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useDashboard } from './hooks/useDashboard'
import { useScreenLayoutStore } from '@/stores/dashboard-layout'
import { useGetWidgets } from '@/app/[locale]/[organization]/(withAuth)/test-api/hooks/useGetWidget'

export interface Dashboard {
  value: string
  label: string
  isDefault: boolean
  id: number
}

const Dashboard = () => {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const { data: dashboards = [] } = useDashboard()
  const [selected, setSelected] = useState<Dashboard>()
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<WidgetType | ''>('')

  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  // const isAuth = useAuthenticated()

  const { setLayouts } = useScreenLayoutStore((state) => ({
    setLayouts: state.setLayouts,
  }))

  const { data: widgetLayout } = useGetWidgets(selected?.id)

  useEffect(() => {
    if (widgetLayout) {
      setLayouts(widgetLayout.layouts)
    }
  }, [widgetLayout])

  const {
    isViewAllDashboard,
    setViewAllDashboard,
    deleteId,
    setDeleteId,
    isEdit,
    setEdit,
  } = useDashboardStore()

  useEffect(() => {
    if (dashboards.length > 0) {
      setSelected(dashboards[0])
    }
  }, [dashboards])

  const handleCreateNewDashBoard = () => {
    setOpen(false)
    const value = {
      value: `new-dashboard-${Math.floor(Math.random() * 1000) + 1}`,
      label: 'Unnamed Dashboard',
      isDefault: false,
      id: Math.floor(Math.random() * 1000) + 1,
    }
    setSelected(value)
  }
  const handleViewAllDashboard = () => {
    setOpen(false)
    setViewAllDashboard(true)
  }
  const handleDeleteSpace = (id: number) => {
    setDeleteId(id)
  }
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
  }

  const handleCancelEdit = () => {
    if (widgetLayout) {
      setLayouts(widgetLayout.layouts)
    }
    setEdit(false)
  }

  return (
    <>
      {!isAddWidgetOpen ? (
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
                      {selected
                        ? dashboards.find(
                            (dashboard) => dashboard.value === selected.value
                          )?.label
                        : 'Dashboard 1'}
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
                            key={dashboard.value}
                            value={dashboard.value}
                            onSelect={(currentValue) => {
                              const itemSelect = dashboards.find(
                                (dashboard) => dashboard.value === currentValue
                              )
                              setSelected(itemSelect!)
                              setOpen(false)
                              setEdit(false)
                            }}
                            className={cn(
                              'cursor-pointer rounded-md hover:bg-brand-fill-dark-soft dark:hover:bg-brand-fill-outermost',
                              {
                                'bg-brand-fill-dark-soft dark:bg-brand-fill-outermost':
                                  selected?.value === dashboard.value,
                              }
                            )}
                          >
                            {dashboard.label}
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
                        onClick={handleCreateNewDashBoard}
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
            !isViewAllDashboard && (
              <div className="flex gap-2 ">
                {isEdit ? (
                  <div className="w-full flex flex-1 gap-2">
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="dark:bg-transparent"
                    >
                      {t('dashboard.cancel')}
                    </Button>
                    <Button
                      onClick={() => setEdit(false)}
                      className="border-brand-stroke-dark-soft font-medium dark:border-brand-stroke-outermost"
                    >
                      {t('dashboard.save')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setEdit(true)
                    }}
                    size="icon"
                    className="size-8 gap-2 rounded-lg"
                  >
                    <Pencil size={16} />
                  </Button>
                )}
              </div>
            )
          }
        >
          <div className="mt-4">
            {isViewAllDashboard ? (
              <DataTable
                columns={getColumns({ handleDeleteSpace, t })}
                data={dashboards}
              />
            ) : (
              <>
                {isEdit && (
                  <div className="mb-6 flex flex-col items-center gap-3">
                    {/* {!selected?.isDefault && (
                      <div className="text-brand-component-text-dark">
                        {t('dashboard.let_add_some_widget')}
                      </div>
                    )} */}
                    <Button
                      className="h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark font-semibold text-white dark:border-brand-component-stroke-light"
                      onClick={() => setIsAddWidgetOpen(true)}
                    >
                      {t('dashboard.add_widget')}
                      <Grid2x2Plus size={16} />
                    </Button>
                  </div>
                )}
                {widgetLayout?.widgets.length === 0 && (
                  <Nodata content={t('common.no_widget')} />
                )}
                <MockData
                  isEdit={isEdit}
                  widgets={widgetLayout?.widgets || []}
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
                  {t('dashboard.are_you_sure')}
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
                <AlertDialogAction
                  className="h-12 flex-1 items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-component-fill-negative hover:opacity-70 dark:border-brand-component-stroke-light"
                  // onClick={() => router.push('/')}
                >
                  {t('dashboard.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </RightSideBarLayout>
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

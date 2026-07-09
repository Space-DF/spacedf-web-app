import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { cn } from '@/lib/utils'
import { useOrganizationValidationStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useIdentityStore } from '@/stores/identity-store'
import { Dashboard } from '@/types/dashboard'
import { ArrowUpRight, ChevronsUpDown, PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

interface Props {
  open: boolean
  onOpenDashboardChange: (open: boolean) => void
  dashboards: Dashboard[]
  isLoadingDashboard: boolean
  onViewAllDashboard: () => void
  setIsOpenDashboardDialog: (open: boolean) => void
  searchDashboard: string
  setSearchDashboard: (value: string) => void
}

const MAX_DASHBOARD_FREE_LIMIT = 1

export const DashboardList = ({
  open,
  setSearchDashboard,
  searchDashboard,
  onOpenDashboardChange,
  setIsOpenDashboardDialog,
  dashboards,
  isLoadingDashboard,
  onViewAllDashboard,
}: Props) => {
  const t = useTranslations('dashboard')
  const { dashboard, setDashboard, setEdit } = useDashboardStore(
    useShallow((state) => ({
      dashboard: state.dashboard,
      setDashboard: state.setDashboard,
      setEdit: state.setEdit,
    }))
  )

  const setOpenDrawerIdentity = useIdentityStore(
    (state) => state.setOpenDrawerIdentity
  )

  const isPro = useOrganizationValidationStore((state) => state.isPro)
  const isAuthenticated = useAuthenticated()

  const currentDashboardName = dashboard?.name || 'Select Dashboard'

  const isReachDashboardLimit =
    !isPro && dashboards.length >= MAX_DASHBOARD_FREE_LIMIT

  const handleOpenDashboardDialog = () => {
    if (isAuthenticated) {
      if (isReachDashboardLimit) return
      setIsOpenDashboardDialog(true)
    } else {
      setOpenDrawerIdentity(true)
    }
  }

  const createDashboardButton = (
    <Button
      className="h-8 w-full gap-2 text-sm font-semibold"
      onClick={handleOpenDashboardDialog}
      disabled={isReachDashboardLimit}
    >
      {t('create_new_dashboard')}
      <PlusIcon size={16} />
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={onOpenDashboardChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-labelledby="dashboard-combobox"
          aria-label="dashboard-label"
          className={cn(
            'line-clamp-1 border flex h-8 border-border justify-between gap-2 whitespace-normal px-2 py-1 text-foreground bg-input',
            {
              'border-brand-component-stroke-dark shadow-dashboard': open,
            }
          )}
        >
          <div className="line-clamp-1 w-full flex-1 text-left">
            {currentDashboardName}
          </div>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 rounded-lg p-2" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            classNameContainer=""
            placeholder={t('search')}
            onValueChange={setSearchDashboard}
            value={searchDashboard}
          />
          <CommandList>
            {!isLoadingDashboard && !dashboards.length && (
              <CommandEmpty>{t('no_dashboard_found')}</CommandEmpty>
            )}
            <CommandGroup className="mt-3 p-0">
              {isLoadingDashboard
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="cursor-pointer rounded-md px-2 py-1.5"
                    >
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))
                : dashboards.map((dashboardItem) => (
                    <CommandItem
                      key={dashboardItem.id}
                      value={dashboardItem.id}
                      onSelect={(currentValue) => {
                        const itemSelect = dashboards.find(
                          (dashboardItem) => dashboardItem.id === currentValue
                        )
                        setDashboard(itemSelect!)
                        onOpenDashboardChange(false)
                        setEdit(false)
                      }}
                      className={cn(
                        'cursor-pointer rounded-md hover:bg-brand-fill-dark-soft dark:hover:bg-brand-fill-outermost',
                        {
                          'bg-brand-fill-dark-soft dark:bg-brand-fill-outermost':
                            dashboard?.id === dashboardItem.id,
                        }
                      )}
                    >
                      {dashboardItem.name}
                    </CommandItem>
                  ))}
            </CommandGroup>
            <Separator className="my-3" />
            <Button
              className="mb-3 h-8 w-full gap-2 text-sm font-semibold"
              variant="outline"
              onClick={onViewAllDashboard}
            >
              {t('view_all_dashboard')}
              <ArrowUpRight />
            </Button>

            {isReachDashboardLimit ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="block w-full">
                    {createDashboardButton}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-60">
                  {t('dashboard_limit_reached')}
                </TooltipContent>
              </Tooltip>
            ) : (
              createDashboardButton
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

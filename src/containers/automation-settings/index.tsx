'use client'

import { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Gem, House, Plus, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AddAutomationDialog } from './components/add-automation-dialog'
import Image from 'next/image'
import { StatCard } from './components/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useTableColumn } from './hooks/useTableColumn'
import { useAutomations } from './hooks/useAutomations'
import { DeleteAutomationDialog } from './components/delete-automation-dialog'
import { useParams, useSearchParams } from 'next/navigation'
import { STATUS_FILTER } from './contanst'
import {
  Automation,
  AutomationStatus,
  AutomationSummary,
} from '@/types/automation'
import { FilterAutomation } from './components/filter-automation'
import { useAutomationSummary } from './hooks/useAutomationSummary'
import { useOrganizationValidationStore } from '@/stores'
import { BreadcrumbHeader } from '@/components/common/breadcrumb-header'
import { Nodata } from '@/components/ui'
import { ProLockedTable } from './components/pro-locked-table'
import { cn } from '@/lib/utils'

const StatCardSkeleton = ({ iconBgClass }: { iconBgClass: string }) => (
  <div className="flex items-center gap-4 rounded-xl border border-border p-4 bg-card">
    <div
      className={`flex size-10 items-center justify-center rounded-full ${iconBgClass}`}
      aria-hidden="true"
    >
      <Skeleton className="size-5 rounded-full" />
    </div>
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-2 h-6 w-12" />
    </div>
  </div>
)

const DEFAULT_SUMMARY: AutomationSummary = {
  total: 0,
  active: 0,
  disabled: 0,
}

const STAT_CARDS = [
  {
    key: 'total',
    labelKey: 'total_automations',
    iconBgClass: 'bg-blue-50',
    icon: <Image src="/images/zap.svg" alt="zap" width={20} height={20} />,
  },
  {
    key: 'active',
    labelKey: 'active',
    iconBgClass: 'bg-green-100',
    icon: <Power size={20} className="text-brand-component-text-positive" />,
  },
  {
    key: 'disabled',
    labelKey: 'disabled',
    iconBgClass: 'bg-gray-200',
    icon: (
      <Image
        src="/images/disable-electricity.svg"
        alt="power-off"
        width={20}
        height={20}
      />
    ),
  },
] as const satisfies readonly {
  key: keyof AutomationSummary
  labelKey: string
  iconBgClass: string
  icon: React.ReactNode
}[]

export const AutomationSettings = () => {
  const t = useTranslations('automation')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const isPro = useOrganizationValidationStore((state) => state.isPro)

  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status')
  const statusFilter = useMemo(() => {
    if (!status || status === 'all') return undefined
    const statusFilter = STATUS_FILTER.find((item) => item.value === status)
    return statusFilter?.value as AutomationStatus
  }, [status])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string>()

  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const { automations, isLoading, mutate } = useAutomations({
    search,
    status: statusFilter,
    spaceSlug,
  })

  const {
    data: automationSummary,
    isLoading: isLoadingSummary,
    mutate: mutateSummary,
  } = useAutomationSummary()

  const [selectedAutomation, setSelectedAutomation] = useState<Automation>()

  const [isEditAutomation, setIsEditAutomation] = useState(false)

  const stats = automationSummary ?? DEFAULT_SUMMARY

  const handleDelete = useCallback((id: string) => {
    setDeleteTargetId(id)
  }, [])

  const handleSuccess = useCallback(() => {
    mutate()
    mutateSummary()
  }, [mutate, mutateSummary])

  const handleConfirmDelete = async () => {
    handleSuccess()
    setDeleteTargetId(undefined)
  }

  const handleSelectAutomation = useCallback((automation: Automation) => {
    setIsAddDialogOpen(true)
    setSelectedAutomation(automation)
  }, [])

  const handleEditAutomation = useCallback((automation: Automation) => {
    handleSelectAutomation(automation)
    setIsEditAutomation(true)
  }, [])

  const columns = useTableColumn(
    handleDelete,
    handleSuccess,
    handleSelectAutomation,
    handleEditAutomation,
    !isPro
  )

  const handleGoback = () => {
    if (window.history.length === 1) return router.replace('/')
    router.back()
  }

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false)
    setSelectedAutomation(undefined)
    setIsEditAutomation(false)
  }

  const addAutomationButton = (
    <Button
      className="gap-2"
      onClick={() => setIsAddDialogOpen(true)}
      disabled={!isPro}
    >
      <Plus size={20} />
      {t('add_automation')}
    </Button>
  )

  const automationTable = (
    <DataTable
      columns={columns}
      data={automations}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      containerClassName={cn(
        'rounded-xl overflow-hidden',
        !isPro && 'rounded-none border-0'
      )}
      tableHeadClass="h-5 leading-5 py-2"
      showPaginate={isPro}
      emptyLabel={
        <Nodata content={t('no_automation')} iconWidth={82} iconHeight={82} />
      }
    />
  )

  return (
    <div className="flex min-h-dvh flex-col bg-brand-background-fill-surface">
      <BreadcrumbHeader
        onBack={handleGoback}
        backLabel={tCommon('back')}
        items={[
          {
            label: tCommon('dashboard'),
            href: `/spaces/${spaceSlug}`,
            icon: <House size={16} />,
          },
          { label: tCommon('automation') },
        ]}
      />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold leading-8 text-brand-component-text-dark dark:text-white">
              {t('automation_settings')}
            </h1>
            {!isPro && (
              <span className="flex items-center gap-1 rounded-button border border-border bg-accent px-2 py-0.5 text-xs font-semibold leading-[18px] text-primary">
                <Gem size={16} />
                PRO
              </span>
            )}
          </div>
          {isPro ? (
            addAutomationButton
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span tabIndex={0}>{addAutomationButton}</span>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="end"
                className="max-w-60 font-medium text-brand-component-text-light"
              >
                <p>{tCommon('available_in_pro_plan')}</p>
                <p>{tCommon('feature_not_in_current_plan')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {STAT_CARDS.map(({ key, labelKey, iconBgClass, icon }) =>
            isLoadingSummary ? (
              <StatCardSkeleton key={key} iconBgClass={iconBgClass} />
            ) : (
              <StatCard
                key={key}
                icon={
                  <div
                    className={`flex size-10 items-center justify-center rounded-full ${iconBgClass}`}
                  >
                    {icon}
                  </div>
                }
                label={t(labelKey)}
                value={stats[key]}
              />
            )
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-xl bg-card p-4">
          <FilterAutomation isPro={isPro} />

          {isPro ? (
            automationTable
          ) : (
            <ProLockedTable>{automationTable}</ProLockedTable>
          )}
        </div>
      </main>

      <AddAutomationDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        onSuccess={handleSuccess}
        isEditable={isEditAutomation}
        automation={selectedAutomation}
        setIsEditAutomation={setIsEditAutomation}
      />

      <DeleteAutomationDialog
        deleteTargetId={deleteTargetId}
        onCancel={() => setDeleteTargetId(undefined)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

'use client'

import { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { ChevronLeft, Plus, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddAutomationDialog } from './components/add-automation-dialog'
import Image from 'next/image'
import { StatCard } from './components/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { useTableColumn } from './hooks/useTableColumn'
import { useAutomations } from './hooks/useAutomations'
import { DeleteAutomationDialog } from './components/delete-automation-dialog'
import { useParams, useSearchParams } from 'next/navigation'
import { STATUS_FILTER } from './contanst'
import { Automation, AutomationStatus } from '@/types/automation'
import { FilterAutomation } from './components/filter-automation'

export const AutomationSettings = () => {
  const t = useTranslations('automation')
  const router = useRouter()

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

  const { automations, totalCount, isLoading, mutate } = useAutomations({
    search,
    status: statusFilter,
    spaceSlug,
  })

  const [selectedAutomation, setSelectedAutomation] = useState<Automation>()

  const [isEditAutomation, setIsEditAutomation] = useState(false)

  const stats = useMemo(() => {
    const total = totalCount
    const active = automations.filter((a) => a.event_rule?.is_active).length
    const disabled = automations.filter((a) => !a.event_rule?.is_active).length
    return { total, active, disabled }
  }, [automations, totalCount])

  const handleDelete = useCallback((id: string) => {
    setDeleteTargetId(id)
  }, [])

  const handleConfirmDelete = async () => {
    mutate()
    setDeleteTargetId(undefined)
  }

  const handleSelectAutomation = useCallback((automation: Automation) => {
    setIsAddDialogOpen(true)
    setSelectedAutomation(automation)
  }, [])

  const columns = useTableColumn(handleDelete, mutate, handleSelectAutomation)

  const handleGoback = () => {
    if (window.history.length === 1) return router.replace('/')
    router.back()
  }

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false)
    setSelectedAutomation(undefined)
    setIsEditAutomation(false)
  }

  return (
    <div className="mx-auto flex w-full container flex-col gap-6 p-6 pb-8">
      <div className="flex items-start justify-between">
        <div className="flex gap-2 items-start">
          <button
            onClick={handleGoback}
            className="h-6 rounded-md text-brand-component-text-dark transition-colors hover:text-brand-component-text-gray dark:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold leading-6 text-brand-component-text-dark dark:text-white">
              {t('automation_settings')}
            </h1>
            <p className="mt-1 text-sm text-brand-component-text-gray">
              {t('manage_and_monitor')}
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          {t('add_automation')}
          <Plus size={16} />
        </Button>
      </div>

      <FilterAutomation />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-50">
              <Image src="/images/zap.svg" alt="zap" width={20} height={20} />
            </div>
          }
          label={t('total_automations')}
          value={stats.total}
        />
        <StatCard
          icon={
            <div className="bg-green-50 size-10 rounded-full flex items-center justify-center">
              <Power size={20} className="text-brand-component-text-positive" />
            </div>
          }
          label={t('active')}
          value={stats.active}
        />
        <StatCard
          icon={
            <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
              <Image
                src="/images/disable-electricity.svg"
                alt="power-off"
                width={20}
                height={20}
              />
            </div>
          }
          label={t('disabled')}
          value={stats.disabled}
        />
      </div>

      <DataTable
        columns={columns}
        data={automations}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        tableHeadClass="text-xs font-semibold text-brand-component-text-gray h-5 leading-5 py-2"
      />

      <AddAutomationDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        onSuccess={mutate}
        isEditable={isEditAutomation}
        automation={selectedAutomation}
      />

      <DeleteAutomationDialog
        deleteTargetId={deleteTargetId}
        onCancel={() => setDeleteTargetId(undefined)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

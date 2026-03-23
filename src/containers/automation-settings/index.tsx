'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { ChevronDown, ChevronLeft, Plus, Power, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputWithIcon } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks'
import Image from 'next/image'
import { StatCard } from './components/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { Automation, AutomationStatus } from '@/types/automation'
import { useTableColumn } from './hooks/useTableColumn'

type StatusFilter = 'all' | AutomationStatus

const MOCK_AUTOMATIONS: Automation[] = [
  {
    id: '1',
    name: 'Morning Lights',
    triggers: ['Time 6:00 AM', '& Temperature > 25°C'],
    targetDevice: 'ABEEWAY_INDUS...',
    assignedAction: ['Turn On', 'Set to 22°C'],
    status: 'active',
    lastTriggered: '2026-03-04 08:30',
    lastUpdated: '2026-03-04 08:30',
  },
  {
    id: '2',
    name: 'Temperature Control',
    triggers: ['Time 6:00 AM', '& Temperature > 25°C', '& Temperature <= 25°C'],
    targetDevice: 'SENSECAP_T100...',
    assignedAction: ['Set to 22°C'],
    status: 'active',
    lastTriggered: '2026-03-04 08:30',
    lastUpdated: '2026-03-04 08:30',
  },
  {
    id: '3',
    name: 'Security Alert',
    triggers: ['Motion Detected'],
    targetDevice: 'RAK4630_1486e...',
    assignedAction: ['Send Notification'],
    status: 'disabled',
    lastTriggered: '2026-03-04 08:30',
    lastUpdated: '2026-03-04 08:30',
  },
  {
    id: '4',
    name: 'Night Mode',
    triggers: ['Time 10:00 PM'],
    targetDevice: 'WLBV1_1212121...',
    assignedAction: ['Turn Off'],
    status: 'active',
    lastTriggered: '2026-03-04 08:30',
    lastUpdated: '2026-03-04 08:30',
  },
  {
    id: '5',
    name: 'Windows Blinds',
    triggers: ['Sunrise'],
    targetDevice: 'DRAGINO_LHT65...',
    assignedAction: ['Open 50%'],
    status: 'disabled',
    lastTriggered: '2026-03-04 08:30',
    lastUpdated: '2026-03-04 08:30',
  },
  {
    id: '6',
    name: 'Energy Saver',
    triggers: ['No Motion for 30 min'],
    targetDevice: 'MILESIGHT_EM3...',
    assignedAction: ['Power Off'],
    status: 'active',
    lastTriggered: '2026-02-28 16:30',
    lastUpdated: '2026-02-28 16:30',
  },
  {
    id: '7',
    name: 'Humidity Control',
    triggers: ['Humidity <40%'],
    targetDevice: 'SEEED_SENSECA...',
    assignedAction: ['Turn On'],
    status: 'active',
    lastTriggered: '2026-02-28 16:30',
    lastUpdated: '2026-02-28 16:30',
  },
  {
    id: '8',
    name: 'Door Lock',
    triggers: ['Time 11:00 PM'],
    targetDevice: 'HELTEC_LORA_N...',
    assignedAction: ['Lock'],
    status: 'disabled',
    lastTriggered: '2026-03-04 08:30',
    lastUpdated: '2026-03-04 08:30',
  },
]

export const AutomationSettings = () => {
  const t = useTranslations('automation')
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [automations, setAutomations] = useState<Automation[]>(MOCK_AUTOMATIONS)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filteredAutomations = useMemo(() => {
    let result = automations

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.targetDevice.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }

    return result
  }, [automations, debouncedSearch, statusFilter])

  const stats = useMemo(() => {
    const total = automations.length
    const active = automations.filter((a) => a.status === 'active').length
    const disabled = automations.filter((a) => a.status === 'disabled').length
    return { total, active, disabled }
  }, [automations])

  const handleToggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'active' ? 'disabled' : 'active' }
          : a
      )
    )
  }

  const handleDelete = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id))
  }

  const columns = useTableColumn(handleToggleStatus, handleDelete)

  return (
    <div className="mx-auto flex w-full container flex-col gap-6 p-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-2 items-start">
          <button
            onClick={() => router.back()}
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
        <Button className="gap-2">
          {t('add_automation')}
          <Plus size={16} />
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4">
        <InputWithIcon
          prefixCpn={
            <Search size={16} className="text-brand-component-text-gray" />
          }
          placeholder={t('search_placeholder')}
          wrapperClass="w-full max-w-80"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
          }}
        />
        <Select
          value={statusFilter}
          onValueChange={(v: StatusFilter) => {
            setStatusFilter(v)
          }}
        >
          <SelectTrigger
            className="w-40 bg-brand-component-fill-dark-soft"
            icon={<ChevronDown size={16} className="opacity-50" />}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_status')}</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="disabled">{t('disabled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredAutomations}
        tableHeadClass="text-xs font-semibold text-brand-component-text-gray h-5 leading-5 py-2"
      />
    </div>
  )
}

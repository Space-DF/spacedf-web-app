import { DataTable } from '@/components/ui/data-table'
import { getColumns } from '@/containers/dashboard/column'
import { useDashboard } from '@/containers/dashboard/hooks/useDashboard'
import { useDashboardStore } from '@/stores/dashboard-store'
import { Dashboard } from '@/types/dashboard'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'
import { DebouncedSearchInput } from '@/components/common/debounced-search-input'

interface Props {
  onSelectDashboard: (dashboard: Dashboard) => void
}

const DashboardTable: React.FC<Props> = ({ onSelectDashboard }) => {
  const t = useTranslations()
  const setDeleteId = useDashboardStore((state) => state.setDeleteId)
  const [searchDashboardDebounced, setSearchDashboardDebounced] = useState('')
  const handleSearch = useCallback(
    (value: string) => setSearchDashboardDebounced(value),
    []
  )
  const { data: dashboards = [], isLoading: isLoadingDashboard } = useDashboard(
    searchDashboardDebounced
  )
  const handleDeleteSpace = useCallback((id: string) => {
    setDeleteId(id)
  }, [])

  const columns = useMemo(() => {
    return getColumns({
      handleDeleteSpace,
      t,
      handleSelectDashboard: onSelectDashboard,
    })
  }, [t, onSelectDashboard])

  return (
    <div className="flex flex-col gap-4">
      <DebouncedSearchInput
        onSearch={handleSearch}
        placeholder={t('dashboard.search')}
        delay={300}
        wrapperClass=""
        iconClassName=""
      />
      <DataTable
        columns={columns}
        data={dashboards}
        isLoading={isLoadingDashboard}
      />
    </div>
  )
}

export default DashboardTable

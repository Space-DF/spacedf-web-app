import { DataTable } from '@/components/ui/data-table'
import { getColumns } from '@/containers/dashboard/column'
import { useDashboard } from '@/containers/dashboard/hooks/useDashboard'
import { useDashboardStore } from '@/stores/dashboard-store'
import { Dashboard } from '@/types/dashboard'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDebounce } from '@/hooks/useDebounce'
import { InputWithIcon } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'

interface Props {
  onSelectDashboard: (dashboard: Dashboard) => void
}

const DashboardTable: React.FC<Props> = ({ onSelectDashboard }) => {
  const t = useTranslations()
  const { setDeleteId } = useDashboardStore(
    useShallow((state) => ({
      setDeleteId: state.setDeleteId,
    }))
  )
  const [searchDashboard, setSearchDashboard] = useState('')
  const searchDashboardDebounced = useDebounce(searchDashboard, 300)
  const { data: dashboards = [], isLoading: isLoadingDashboard } = useDashboard(
    searchDashboardDebounced
  )
  const handleDeleteSpace = (id: string) => {
    setDeleteId(id)
  }

  const columns = useMemo(() => {
    return getColumns({
      handleDeleteSpace,
      t,
      handleSelectDashboard: onSelectDashboard,
    })
  }, [t, onSelectDashboard])

  return (
    <div className="flex flex-col gap-4">
      <InputWithIcon
        prefixCpn={<SearchIcon size={18} />}
        placeholder={t('dashboard.search')}
        value={searchDashboard}
        onChange={(e) => setSearchDashboard(e.target.value)}
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

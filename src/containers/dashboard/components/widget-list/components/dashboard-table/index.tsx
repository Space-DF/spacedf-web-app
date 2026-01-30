import { DataTable } from '@/components/ui/data-table'
import { getColumns } from '@/containers/dashboard/column'
import { useDashboard } from '@/containers/dashboard/hooks/useDashboard'
import { useDashboardStore } from '@/stores/dashboard-store'
import { Dashboard } from '@/types/dashboard'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { DashboardDialog } from '../dashboard-dialog'
import { sleep } from '@/utils'

interface Props {
  setOpen: (open: boolean) => void
  setIsOpenDashboardDialog: (open: boolean) => void
  isOpenDashboardDialog: boolean
}

const DashboardTable: React.FC<Props> = ({
  setOpen,
  setIsOpenDashboardDialog,
  isOpenDashboardDialog,
}) => {
  const t = useTranslations()
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard>()
  const { setDeleteId, setDashboard } = useDashboardStore(
    useShallow((state) => ({
      setDeleteId: state.setDeleteId,
      setDashboard: state.setDashboard,
    }))
  )
  const { data: dashboards = [] } = useDashboard()
  const handleDeleteSpace = (id: string) => {
    setDeleteId(id)
  }

  const handleSelectDashboard = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard)
    setIsOpenDashboardDialog(true)
  }

  const columns = useMemo(() => {
    return getColumns({ handleDeleteSpace, t, handleSelectDashboard })
  }, [t])

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
        dashboard={selectedDashboard}
      />
      <DataTable columns={columns} data={dashboards} />
    </>
  )
}

export default DashboardTable

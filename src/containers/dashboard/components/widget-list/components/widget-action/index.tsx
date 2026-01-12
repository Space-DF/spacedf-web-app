import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  isViewAllDashboard: boolean
  isEdit: boolean
  handleCancelEdit: () => void
  handleSaveDashboard: () => void
  isUpdatingWidgets: boolean
  setEdit: (edit: boolean) => void
  dashboardId?: string
}

export const WidgetAction: React.FC<Props> = ({
  isViewAllDashboard,
  isEdit,
  handleCancelEdit,
  handleSaveDashboard,
  isUpdatingWidgets,
  setEdit,
  dashboardId,
}) => {
  const t = useTranslations()
  if (isViewAllDashboard || !dashboardId) return <></>
  return (
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
            onClick={handleSaveDashboard}
            className="border-brand-stroke-dark-soft font-medium dark:border-brand-stroke-outermost"
            loading={isUpdatingWidgets}
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

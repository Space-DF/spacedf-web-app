// import Pen from '@/components/icons/pen'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { MouseEvent } from 'react'

interface WidgetProp {
  children?: React.ReactNode
  className?: string
  isEdit?: boolean
  onDelete?: () => void
  onEdit?: () => void
}

export const WidgetContainer = ({
  children,
  className,
  isEdit,
  onDelete,
  // onEdit,
}: WidgetProp) => {
  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onDelete?.()
  }
  // const handleEdit = (e: MouseEvent<HTMLButtonElement>) => {
  //   e.stopPropagation()
  //   onEdit?.()
  // }
  return (
    <div
      className={cn(
        'relative size-full rounded-card border border-background-stroke-middle bg-card p-2 space-y-1 overflow-hidden',
        className
      )}
    >
      {isEdit && (
        <div className="dashboard-widget-toolbar absolute top-0 right-0 z-20">
          <div className="bg-brand-component-fill-secondary-soft flex items-center space-x-1 rounded-l-card rounded-tr-card p-0.5">
            {/* <button
              type="button"
              className="rounded p-0.5 hover:opacity-80"
              aria-label="Edit widget"
              onClick={handleEdit}
            >
              <Pen width={16} height={16} />
            </button> */}
            <button
              type="button"
              className="rounded hover:opacity-80"
              onClick={handleDelete}
              aria-label="Delete widget"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export const WidgetTitle = ({ children, className }: WidgetProp) => (
  <div
    className={cn(
      'line-clamp-1 text-sm font-medium text-foreground',
      className
    )}
  >
    {children}
  </div>
)

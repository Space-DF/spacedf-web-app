import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { MouseEvent } from 'react'

interface WidgetProp {
  children?: React.ReactNode
  className?: string
  isEdit?: boolean
  onDelete?: () => void
}

export const WidgetContainer = ({
  children,
  className,
  isEdit,
  onDelete,
}: WidgetProp) => {
  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onDelete?.()
  }
  return (
    <div
      className={cn(
        'relative size-full rounded-md border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-2 dark:bg-brand-component-fill-gray-soft space-y-1 overflow-hidden',
        className
      )}
    >
      {isEdit && (
        <div className="dashboard-widget-toolbar absolute top-0 right-0 z-20">
          <div className="bg-brand-component-fill-secondary-soft flex items-center space-x-1 rounded-l-md rounded-tr-md p-0.5">
            {/* <button type="button" className="rounded p-0.5 hover:opacity-80">
              <Pen width={16} height={16} />
            </button> */}
            <button
              type="button"
              className="rounded hover:opacity-80"
              onClick={handleDelete}
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
      'line-clamp-1 text-sm font-medium text-brand-component-text-dark',
      className
    )}
  >
    {children}
  </div>
)

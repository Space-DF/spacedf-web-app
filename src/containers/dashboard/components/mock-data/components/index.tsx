import { cn } from '@/lib/utils'

interface WidgetProp {
  children?: React.ReactNode
  className?: string
}

export const WidgetContainer = ({ children, className }: WidgetProp) => (
  <div
    className={cn(
      'size-full rounded-md border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-2 dark:bg-brand-component-fill-gray-soft space-y-1',
      className
    )}
  >
    {children}
  </div>
)

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

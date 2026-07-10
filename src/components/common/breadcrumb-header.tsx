'use client'

import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export interface BreadcrumbHeaderItem {
  label: string
  href?: string
  icon?: ReactNode
}

interface BreadcrumbHeaderProps {
  items: BreadcrumbHeaderItem[]
  onBack: () => void
  backLabel: string
  className?: string
}

export const BreadcrumbHeader = ({
  items,
  onBack,
  backLabel,
  className,
}: BreadcrumbHeaderProps) => {
  return (
    <header
      className={cn(
        'flex h-16 w-full shrink-0 items-center gap-3 border-b border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost px-10 py-3',
        className
      )}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-brand-component-stroke-dark-soft bg-brand-component-fill-light text-brand-component-text-dark shadow-sm transition-colors hover:bg-accent dark:text-white"
      >
        <ChevronLeft size={20} />
      </button>
      <nav aria-label={backLabel}>
        <ol className="flex items-center">
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1
            const content = (
              <span className="flex items-center gap-1 truncate">
                {item.icon}
                {item.label}
              </span>
            )

            return (
              <li key={item.label} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    size={16}
                    className="text-brand-component-text-gray"
                  />
                )}
                {isCurrent || !item.href ? (
                  <span
                    aria-current={isCurrent ? 'page' : undefined}
                    className={cn(
                      'text-sm',
                      isCurrent
                        ? 'font-bold text-brand-component-text-dark dark:text-white'
                        : 'font-medium text-brand-component-text-gray'
                    )}
                  >
                    {content}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-brand-component-text-gray transition-colors hover:text-brand-component-text-dark dark:hover:text-white"
                  >
                    {content}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </header>
  )
}

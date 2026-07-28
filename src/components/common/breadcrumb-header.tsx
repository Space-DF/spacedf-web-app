'use client'

import { Fragment, ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

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
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap gap-0 sm:gap-0">
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1
            const leafClassName = 'inline-flex items-center gap-1 truncate'
            const content = (
              <>
                {item.icon}
                {item.label}
              </>
            )

            return (
              <Fragment key={item.label}>
                {index > 0 && (
                  <BreadcrumbSeparator className="text-brand-component-text-gray [&>svg]:size-4" />
                )}
                <BreadcrumbItem>
                  {isCurrent ? (
                    <BreadcrumbPage
                      className={cn(
                        leafClassName,
                        'font-bold text-brand-component-text-dark dark:text-white'
                      )}
                    >
                      {content}
                    </BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink
                      asChild
                      className={cn(
                        leafClassName,
                        'font-medium text-brand-component-text-gray hover:text-brand-component-text-dark dark:hover:text-white'
                      )}
                    >
                      <Link href={item.href}>{content}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span
                      className={cn(
                        leafClassName,
                        'font-medium text-brand-component-text-gray'
                      )}
                    >
                      {content}
                    </span>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

import { DebouncedSearchInput } from '@/components/common/debounced-search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { STATUS_FILTER } from '../contanst'
import { Messages } from '@/types/global'

type StatusFilter = 'all' | 'active' | 'disabled'

export const FilterAutomation = () => {
  const t = useTranslations('automation')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const pathname = usePathname()
  const router = useRouter()

  const handleSearch = useCallback(
    (value: string) => setDebouncedSearch(value),
    []
  )
  const handleStatusFilter = (v: StatusFilter) => {
    setStatusFilter(v)
  }

  useEffect(() => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      status: statusFilter,
    })
    router.replace(`${pathname}?${params.toString()}`)
  }, [pathname, router, debouncedSearch, statusFilter])

  return (
    <div className="flex items-center justify-between gap-4">
      <DebouncedSearchInput
        onSearch={handleSearch}
        placeholder={t('search_placeholder')}
        wrapperClass="w-full max-w-80"
        delay={300}
        iconSize={16}
        iconClassName="text-brand-component-text-gray"
      />
      <Select value={statusFilter} onValueChange={handleStatusFilter}>
        <SelectTrigger
          className="w-40 bg-input border border-border"
          icon={
            <ChevronDown
              size={16}
              className="opacity-50 text-muted-foreground"
            />
          }
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTER.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {t(item.label as keyof Messages['automation'])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

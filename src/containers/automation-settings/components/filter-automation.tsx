import { InputWithIcon } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { STATUS_FILTER } from '../contanst'
import { Messages } from '@/types/global'

type StatusFilter = 'all' | 'active' | 'disabled'

export const FilterAutomation = () => {
  const t = useTranslations('automation')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const pathname = usePathname()
  const router = useRouter()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
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
      <InputWithIcon
        prefixCpn={
          <Search size={16} className="text-brand-component-text-gray" />
        }
        placeholder={t('search_placeholder')}
        wrapperClass="w-full max-w-80"
        value={searchQuery}
        onChange={handleSearch}
      />
      <Select value={statusFilter} onValueChange={handleStatusFilter}>
        <SelectTrigger
          className="w-40 bg-brand-component-fill-dark-soft"
          icon={<ChevronDown size={16} className="opacity-50" />}
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

import { EqualNot } from 'lucide-react'
import { And, Graph } from '@/components/icons'

export const STATUS_FILTER = [
  {
    label: 'all_status',
    value: 'all',
  },
  {
    label: 'active',
    value: 'true',
  },
  {
    label: 'disabled',
    value: 'false',
  },
]

export const OPERATORS = [
  { value: 'lte', label: '<=' },
  { value: 'gte', label: '>=' },
  { value: 'eq', label: '==' },
  { value: 'neq', label: '!=' },
  { value: 'lt', label: '<' },
  { value: 'gt', label: '>' },
]

export const GROUP_ICONS: Record<
  'and' | 'or' | 'not',
  React.ComponentType<{ className?: string }>
> = {
  and: And,
  or: Graph,
  not: EqualNot,
}

export const GROUP_LABEL: Record<'and' | 'or' | 'not', string> = {
  and: 'And',
  or: 'Or',
  not: 'Not',
}

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TagValue = ({ value }: { value: string }) => {
  const isBuilding = value === 'building'
  const className = isBuilding
    ? 'bg-brand-light-blue-100 text-brand-component-text-info hover:bg-brand-light-blue-100/80'
    : 'bg-brand-light-yellow-100 text-brand-component-text-warning hover:bg-brand-light-yellow-100/80'
  return (
    <Badge className={cn(className, 'rounded')}>
      {isBuilding ? 'Building' : 'Area'}
    </Badge>
  )
}

export default TagValue

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Link } from '@/i18n/routing'

type AddNewSpaceProps = {
  disabled?: boolean
}

const buttonClassName = 'w-full gap-2 rounded-[10px] font-semibold'

const AddNewSpace = ({ disabled = false }: AddNewSpaceProps) => {
  const t = useTranslations('space')
  const tCommon = useTranslations('common')

  if (disabled) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="block w-full">
            <Button size="sm" disabled className={buttonClassName}>
              <Plus size={16} />
              {t('new_space')}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-60">
          {tCommon('plan_limit_reached')}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button asChild size="sm" className={buttonClassName}>
      <Link href={'/spaces/new'}>
        <Plus size={16} />
        {t('new_space')}
      </Link>
    </Button>
  )
}

export default AddNewSpace

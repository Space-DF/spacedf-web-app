import { CirclePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/routing'

const AddNewSpace = () => {
  const t = useTranslations('space')
  return (
    <Link
      href={'/spaces/new'}
      className="relative flex w-full cursor-pointer items-center px-0 py-2 text-sm"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <CirclePlus size={20} />
        {t('create_new_space')}
      </div>
      <DropdownMenuShortcut className="text-brand-dark-text-gray">
        ⌘⌥N
      </DropdownMenuShortcut>
    </Link>
  )
}

export default AddNewSpace

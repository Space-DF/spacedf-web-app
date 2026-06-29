'use client'

import { useIdentityStore } from '@/stores/identity-store'
import { LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'

const IdentityButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const setOpenDrawerIdentity = useIdentityStore(
    (state) => state.setOpenDrawerIdentity
  )
  const t = useTranslations('common')
  return (
    <div
      className="flex h-10 rounded-button cursor-pointer items-center justify-center bg-primary text-primary-foreground duration-300 group-hover:opacity-80"
      onClick={() => setOpenDrawerIdentity(true)}
    >
      {isCollapsed ? (
        <LogIn size={18} />
      ) : (
        <p className="max-w-[90%] truncate text-[14px] font-medium">
          {t('get_started')}
        </p>
      )}
    </div>
  )
}

export default IdentityButton

'use client'

import { useIdentityStore } from '@/stores/identity-store'
import { LogIn } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useTranslations } from 'next-intl'

const IdentityButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const t = useTranslations('common')
  const setOpenDrawerIdentity = useIdentityStore(
    useShallow((state) => state.setOpenDrawerIdentity),
  )
  return (
    <div
      className="group h-10 w-full min-w-10 cursor-pointer rounded-xl border border-brand-bright-lavender bg-transparent p-[2px] text-white"
      onClick={() => setOpenDrawerIdentity(true)}
    >
      <div className="flex h-full items-center justify-center rounded-lg border-brand-bright-lavender bg-gradient-to-r from-brand-very-light-blue to-brand-bright-lavender duration-300 group-hover:opacity-80">
        {isCollapsed ? (
          <LogIn size={18} />
        ) : (
          <p className="max-w-[90%] truncate text-xs font-semibold uppercase">
            {t('get_started')}
          </p>
        )}
      </div>
    </div>
  )
}

export default IdentityButton

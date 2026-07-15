import { Separator } from '@/components/ui/separator'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { cn } from '@/lib/utils'
import { CircleUser, Fingerprint } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import Account from './account'
import Appearance from './appearance'
import DeleteAccount from './delete-account'
import Plans from './plans'
import Profile from './profile'
import { useGeneralSetting } from './store/useGeneralSetting'
import { CreditCard, Trash2 } from '@/components/icons'
import { CircleHalfTilt } from '@/components/icons/circle-half-tilt'

const settings = [
  {
    key: 'general',
    icon: (
      <CircleUser
        size={16}
        className="text-accent-foreground size-4 font-medium"
      />
    ),
    titleKey: 'profile',
  },
  {
    key: 'security',
    icon: (
      <Fingerprint size={16} className="text-accent-foreground font-medium" />
    ),
    titleKey: 'security',
  },
  {
    key: 'appearance',
    icon: (
      <CircleHalfTilt
        className="text-accent-foreground size-4 font-medium"
        width={16}
        height={16}
      />
    ),
    titleKey: 'appearance',
  },
  {
    key: 'plans',
    icon: (
      <CreditCard
        className="text-accent-foreground size-4 font-medium"
        width={16}
        height={16}
      />
    ),
    titleKey: 'plans',
  },
  {
    key: 'delete_account',
    icon: (
      <Trash2
        width={16}
        height={16}
        className="text-accent-foreground font-medium"
      />
    ),
    titleKey: 'delete_account',
  },
]

const GeneralSetting = () => {
  const isOpen = useGeneralSetting((state) => state.isOpen)
  const currentSetting = useGeneralSetting((state) => state.currentSetting)
  const setIsOpen = useGeneralSetting((state) => state.setIsOpen)
  const setCurrentSetting = useGeneralSetting(
    (state) => state.setCurrentSetting
  )

  const t = useTranslations('common')

  const isAuthenticated = useAuthenticated()

  useEffect(() => {
    setCurrentSetting(isAuthenticated ? 'general' : 'appearance')
  }, [isAuthenticated])

  const authSettings = useMemo(() => {
    if (isAuthenticated) {
      return settings
    }
    return settings.filter(
      (setting) =>
        !['delete_account', 'security', 'general', 'plans'].includes(
          setting.key
        )
    )
  }, [isAuthenticated])

  const currentTitleKey = useMemo(
    () =>
      settings.find((setting) => setting.key === currentSetting)?.titleKey ??
      'general_settings',
    [currentSetting]
  )

  const renderSetting = useMemo(() => {
    switch (currentSetting) {
      case 'general':
        return <Profile />
      case 'security':
        return <Account />
      case 'appearance':
        return <Appearance />
      case 'plans':
        return <Plans />
      case 'delete_account':
        return <DeleteAccount />
      default:
        return <></>
    }
  }, [currentSetting])

  const handleSettingClick = (key: string) => {
    setCurrentSetting(key)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setCurrentSetting(isAuthenticated ? 'general' : 'appearance')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0 text-sm text-brand-component-text-dark sm:max-w-[632px]">
        <div className="flex items-stretch">
          <div className="w-[200px] shrink-0 border-r border-brand-stroke-dark-soft p-3 dark:border-brand-stroke-outermost">
            <div className="flex flex-col gap-[2px]">
              {authSettings.map((setting) => {
                const isActive = setting.key === currentSetting

                return (
                  <React.Fragment key={setting.key}>
                    {setting.key === 'delete_account' && (
                      <Separator className="my-1" />
                    )}
                    <div
                      className={cn(
                        'flex h-8 cursor-pointer text-accent-foreground items-center gap-2 rounded-[10px] p-1.5 font-medium duration-300 hover:bg-accent/80',
                        isActive ? 'bg-accent' : 'bg-transparent'
                      )}
                      onClick={() => handleSettingClick(setting.key)}
                    >
                      {setting.icon}
                      <span className="flex-1 truncate">
                        {t(setting.key as any)}
                      </span>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <DialogHeader className="px-6 pb-3 pt-4">
              <DialogTitle className="font-semibold text-[16px] text-brand-component-text-dark">
                {t(currentTitleKey as any)}
              </DialogTitle>
            </DialogHeader>
            <div className="min-h-[350px] flex-1 p-4">
              <div className="text-brand-component-text-dark">
                {renderSetting}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GeneralSetting

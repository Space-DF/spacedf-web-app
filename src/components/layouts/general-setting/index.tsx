import { PropsWithChildren, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog'
import { CircleUser, Trash } from 'lucide-react'
import { Laptop, SettingIcon } from '../../icons'
import { cn } from '@/lib/utils'
import Profile from './profile'
import Account from './account'
import Appearance from './appearance'
// import Language from './language'
import DeleteAccount from './delete-account'
import React from 'react'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useGeneralSetting } from './store/useGeneralSetting'

const settings = [
  {
    key: 'profile',
    icon: <CircleUser size={16} />,
    label: 'Profile',
  },
  {
    key: 'account',
    icon: <SettingIcon />,
    label: 'Account',
  },
  {
    key: 'appearance',
    icon: <Laptop />,
    label: 'Appearance',
  },
  // {
  //   key: 'language',
  //   icon: <Globe size={16} />,
  //   label: 'Language',
  // },
  {
    key: 'delete_account',
    icon: <Trash size={16} />,
    label: 'Delete account',
  },
]

const GeneralSetting = ({ children }: PropsWithChildren) => {
  const { isOpen, currentSetting, setIsOpen, setCurrentSetting } =
    useGeneralSetting()

  const t = useTranslations('common')

  const isAuthenticated = useAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentSetting('profile')
    }
  }, [isAuthenticated])

  const authSettings = useMemo(() => {
    if (isAuthenticated) {
      return settings
    }
    return settings.filter(
      (setting) =>
        setting.key !== 'delete_account' &&
        setting.key !== 'account' &&
        setting.key !== 'profile'
    )
  }, [isAuthenticated])

  const renderSetting = useMemo(() => {
    switch (currentSetting) {
      case 'profile':
        return <Profile />
      case 'account':
        return <Account />
      case 'appearance':
        return <Appearance />
      // case 'language':
      //   return <Language />
      case 'delete_account':
        return <DeleteAccount />
      default:
        return <></>
    }
  }, [currentSetting])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setCurrentSetting(isAuthenticated ? 'profile' : 'appearance')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="text-sm text-brand-component-text-dark sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('general_settings')}</DialogTitle>
        </DialogHeader>
        <div className="flex">
          <div className="w-[200px] border-r border-brand-stroke-dark-soft py-4 dark:border-brand-stroke-outermost">
            <div className="flex flex-col gap-1">
              {authSettings.map((setting) => {
                const isActive = setting.key === currentSetting

                return (
                  <React.Fragment key={setting.key}>
                    {setting.key === 'delete_account' && (
                      <Separator className="my-1.5" />
                    )}
                    <div
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-4 py-[6px] font-medium duration-300 hover:bg-brand-fill-dark-soft/80 hover:dark:bg-brand-text-dark/80',
                        isActive
                          ? 'border-r-2 border-black bg-brand-fill-dark-soft dark:border-brand-heading dark:bg-brand-text-dark dark:text-white'
                          : 'border-none bg-transparent text-brand-text-gray',
                        {
                          'text-brand-semantic-accent':
                            setting.key === 'delete_account',
                        }
                      )}
                      onClick={() => setCurrentSetting(setting.key)}
                    >
                      {setting.icon}
                      {t(setting.key as any)}
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
          <div
            className={cn(
              'min-h-[350px] flex-1 p-4',
              currentSetting === 'appearance' &&
                'bg-brand-fill-surface dark:bg-brand-fill-outermost'
            )}
          >
            <div className="text-brand-component-text-dark dark:text-brand-dark-text-gray">
              {renderSetting}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GeneralSetting

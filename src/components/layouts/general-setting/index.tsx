import { PropsWithChildren, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog'
import { CircleUser, Globe } from 'lucide-react'
import { Laptop, SettingIcon } from '../../icons'
import { cn } from '@/lib/utils'
import Profile from './profile'
import Account from './account'
import Appearance from './appearance'
import Language from './language'

const settings = () => [
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
  {
    key: 'language',
    icon: <Globe size={16} />,
    label: 'Language',
  },
]

const GeneralSetting = ({ children }: PropsWithChildren) => {
  const [currentSetting, setCurrentSetting] = useState('profile')

  const renderSetting = useMemo(() => {
    switch (currentSetting) {
      case 'profile':
        return <Profile />
      case 'account':
        return <Account />
      case 'appearance':
        return <Appearance />
      case 'language':
        return <Language />
      default:
        return <></>
    }
  }, [currentSetting])

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="text-sm text-brand-text-dark sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>General Setting</DialogTitle>
        </DialogHeader>
        <div className="flex">
          <div className="w-[200px] border-r border-brand-stroke-dark-soft py-4 dark:border-brand-stroke-outermost">
            <div className="flex flex-col gap-1">
              {settings().map((setting) => {
                const isActive = setting.key === currentSetting

                return (
                  <div
                    key={setting.key}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 px-4 py-[6px] font-medium duration-300 hover:bg-brand-fill-dark-soft/80 hover:dark:bg-brand-text-dark/80',
                      isActive
                        ? 'border-r-2 border-black bg-brand-fill-dark-soft dark:border-brand-heading dark:bg-brand-text-dark dark:text-white'
                        : 'border-none bg-transparent text-brand-text-gray',
                    )}
                    onClick={() => setCurrentSetting(setting.key)}
                  >
                    {setting.icon}
                    {setting.label}
                  </div>
                )
              })}
            </div>
          </div>
          <div
            className={cn(
              'min-h-[350px] flex-1 p-4',
              currentSetting === 'appearance' &&
                'bg-brand-fill-surface dark:bg-brand-fill-outermost',
            )}
          >
            <div className="text-brand-text-dark dark:text-brand-dark-text-gray">
              {renderSetting}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GeneralSetting

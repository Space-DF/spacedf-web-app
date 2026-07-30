'use client'

import { LOCAL_STORAGE_KEYS } from '@/constants'
import { useIsDemo } from '@/hooks/useIsDemo'
import { locales } from '@/i18n/request'
import { usePathname, useRouter as useLocaleRouter } from '@/i18n/routing'
import { Locale } from '@/types/global'
import { getInitials } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'
import { Globe, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { SettingIcon } from '../icons'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Skeleton } from '../ui/skeleton'
import { useProfile } from './general-setting/hooks/useProfile'
import { useGeneralSetting } from './general-setting/store/useGeneralSetting'

const UserMenu = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const t = useTranslations('common')
  const tLanguage = useTranslations('languageName')

  const locale = useLocale()
  const pathname = usePathname()
  const localeRouter = useLocaleRouter()
  const router = useRouter()
  const queryClient = useQueryClient()

  const isDemo = useIsDemo()
  const openDialog = useGeneralSetting((state) => state.openDialog)

  const { data: profile, isLoading } = useProfile()

  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(' ')
  const displayName = fullName || profile?.email || ''

  const handleSignOut = async () => {
    if (isDemo) return
    await signOut({ redirect: false })
    localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTIF_PERMISSION_KEY)
    window.history.replaceState({}, '', window.location.pathname)
    router.push('/', { scroll: false })
    queryClient.clear()
  }

  const avatar = (
    <Avatar className="size-7">
      <AvatarImage src={profile?.url_avatar} alt={displayName} />
      <AvatarFallback className="text-xs font-medium uppercase">
        {getInitials(fullName, profile?.email)}
      </AvatarFallback>
    </Avatar>
  )

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-1">
        <Skeleton className="size-7 rounded-full" />
        {!isCollapsed && <Skeleton className="h-4 flex-1" />}
      </div>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {isCollapsed ? (
          <button className="flex items-center justify-center rounded-full duration-300 hover:opacity-80">
            {avatar}
          </button>
        ) : (
          <button className="flex w-full items-center gap-2 rounded-button p-1 text-left duration-300 hover:bg-accent">
            {avatar}
            <p className="flex-1 truncate text-sm font-medium text-accent-foreground">
              {displayName}
            </p>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isCollapsed ? 'end' : 'start'}
        side={isCollapsed ? 'right' : 'top'}
        className="w-56 bg-background"
      >
        {profile?.email && (
          <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
            {profile.email}
          </DropdownMenuLabel>
        )}

        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onSelect={() => openDialog()}
        >
          <SettingIcon />
          <span>{t('general_settings')}</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="group cursor-pointer gap-2">
            <Globe size={16} className="group-hover:text-accent-foreground" />
            <span className="group-hover:text-accent-foreground">
              {t('language')}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {locales.map((item) => (
                <DropdownMenuCheckboxItem
                  key={item}
                  className="cursor-pointer"
                  checked={item === locale}
                  onSelect={() =>
                    localeRouter.push(pathname, { locale: item as Locale })
                  }
                >
                  {tLanguage(item)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2"
          disabled={isDemo}
          onSelect={handleSignOut}
        >
          <LogOut size={16} />
          <span>{t('sign_out')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu

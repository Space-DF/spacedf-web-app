'use client'

import { COOKIES, NavigationData, Navigation as TNavigation } from '@/constants'
import { useKeyboardShortcut, useMounted } from '@/hooks'
import { useResponsiveLayout } from '@/hooks/use-responsive-layout'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useIsDemo } from '@/hooks/useIsDemo'
import { cn } from '@/lib/utils'
import { DynamicLayout, getNewLayouts, useLayout } from '@/stores'
import { getCookie, setCookie, uppercaseFirstLetter } from '@/utils'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { forwardRef, useEffect, useState } from 'react'
import { ImperativePanelGroupHandle } from 'react-resizable-panels'
import { useShallow } from 'zustand/react/shallow'
import {
  Question,
  SettingIcon,
  SidebarCollapsedSimple,
  SidebarSimpleIcon,
} from '../icons'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import GeneralSetting from './general-setting'
import IdentityButton from './identity-button'
import ModalSearch from './modal-search'
import SwitchSpace from './switch-space'
import ThemeToggle from './theme-toggle'
type SidebarChildProps = {
  onCollapseChanges?: () => void
}

const Sidebar = forwardRef<ImperativePanelGroupHandle | null>((props, ref) => {
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const cookieDirty = useLayout(useShallow((state) => state.cookieDirty))
  const [open, setOpen] = useState(false)

  const setDynamicLayouts = useLayout(
    useShallow((state) => state.setDynamicLayouts)
  )

  const defaultCollapsed = getCookie<boolean>(COOKIES.SIDEBAR_COLLAPSED, false)
  const defaultDynamicLayouts = getCookie(
    COOKIES.DYNAMIC_LAYOUTS,
    [] as DynamicLayout[]
  )
  const [sidebarWidth, mainWidth] = useResponsiveLayout()

  useEffect(() => {
    setCollapsed(defaultCollapsed)
  }, [defaultCollapsed])

  useEffect(() => {
    if (cookieDirty) return

    setDynamicLayouts(defaultDynamicLayouts)
  }, [defaultDynamicLayouts, cookieDirty])

  const handleCommandSearch = () => {
    setOpen((open) => !open)
  }

  const handleCollapseChanges = (isCollapsed: boolean) => {
    if (!ref || !('current' in ref)) return

    if (isCollapsed) return ref?.current?.setLayout([4, 96])
    ref?.current?.setLayout([sidebarWidth, mainWidth])
  }

  useKeyboardShortcut({
    keys: ['k'],
    onPress: handleCommandSearch,
  })

  return (
    <>
      <div
        className={cn(
          `flex h-dvh border-r border-brand-stroke-dark-soft p-4 text-sm text-brand-component-text-dark shadow-md transition-all duration-300 dark:border-brand-stroke-outermost dark:bg-brand-fill-outermost`
        )}
        id="sidebar-id"
      >
        <ExpandedSidebar
          onCollapseChanges={() => handleCollapseChanges(true)}
        />
        <CollapsedSidebar
          onCollapseChanges={() => handleCollapseChanges(false)}
        />
      </div>
      <ModalSearch open={open} setOpen={setOpen} />
    </>
  )
})

const ExpandedSidebar = ({ onCollapseChanges }: SidebarChildProps) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const router = useRouter()
  const t = useTranslations('common')
  const { mounted } = useMounted()

  const isAuth = useAuthenticated()
  const isDemo = useIsDemo()

  const handleCollapsedChange = () => {
    setCollapsed(true)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
    onCollapseChanges?.()
  }

  const handleSignOut = () => {
    if (isDemo) return
    signOut({ redirect: false })
    router.replace('/')
  }

  return (
    <div
      className={cn(
        'flex grow flex-col transition-all duration-300',
        isCollapsed
          ? '-translate-x- !h-0 !w-0 animate-opacity-hide-effect overflow-hidden opacity-0'
          : 'w-full translate-x-0 animate-opacity-display-effect opacity-100'
      )}
    >
      <div className="flex-1">
        <div className={cn('flex items-center justify-between gap-3')}>
          <div className="min-w-14 flex-1">
            {/* <IdentityButton isCollapsed={isCollapsed} /> */}
            {isAuth && mounted && <SwitchSpace isCollapsed={isCollapsed} />}
            {!isAuth && mounted && <IdentityButton isCollapsed={isCollapsed} />}
          </div>
          <SidebarSimpleIcon
            className="cursor-pointer justify-self-end text-brand-text-gray"
            onClick={handleCollapsedChange}
          />
        </div>

        <Separator orientation="horizontal" className="mt-3" />
        <Navigations />
      </div>

      <div className="flex flex-col gap-1">
        <GeneralSetting>
          <Button
            variant="ghost"
            className="h-8 justify-start gap-2 p-0 text-brand-text-gray duration-300 hover:bg-transparent dark:text-brand-dark-text-gray dark:hover:text-white"
          >
            <SettingIcon />
            <p className="text-sm">{t('general_settings')}</p>
          </Button>
        </GeneralSetting>

        {isAuth && (
          <Button
            variant="ghost"
            className="h-8 justify-start gap-2 p-0 text-brand-text-gray duration-300 hover:bg-transparent dark:text-brand-dark-text-gray dark:hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            <p className="text-sm">{t('sign_out')}</p>
          </Button>
        )}

        <ThemeToggle isCollapsed={isCollapsed} />
        {!isAuth && (
          <Button className="flex items-center space-x-2 bg-[#6E4AFF33] border-none hover:bg-[#A78BF633] text-sm font-semibold text-brand-component-text-secondary py-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Question className="cursor-pointer" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-96 border-none">
                  <p>{t('viewing_dummy')}</p>
                  <TooltipArrow className="z-10 fill-popover text-popover" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-[14px]">Demo Version</span>
          </Button>
        )}
      </div>
    </div>
  )
}

const CollapsedSidebar = ({ onCollapseChanges }: SidebarChildProps) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const router = useRouter()

  const { mounted } = useMounted()
  const t = useTranslations('common')

  const isAuth = useAuthenticated()

  const handleCollapsedChange = () => {
    setCollapsed(false)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
    onCollapseChanges?.()
  }

  const handleSignOut = () => {
    signOut({ redirect: false })
    router.replace('/')
  }

  return (
    <div
      className={cn(
        'flex flex-col py-2 transition-all duration-200',
        isCollapsed
          ? 'w-full translate-x-0 animate-opacity-display-effect opacity-100'
          : '!h-0 !w-0 -translate-x-full animate-opacity-hide-effect overflow-hidden opacity-0'
      )}
    >
      <div
        className={cn(
          'flex grow flex-col items-center justify-center duration-200'
        )}
      >
        <div className="flex flex-1 flex-col items-center">
          <div className="flex flex-col space-y-3 items-center mb-3">
            <div className="flex items-center justify-center">
              <SidebarCollapsedSimple
                className="col-span-1 cursor-pointer justify-self-end text-brand-text-gray"
                onClick={handleCollapsedChange}
              />
            </div>
            {isAuth && mounted && <SwitchSpace isCollapsed={isCollapsed} />}
            {!isAuth && mounted && <IdentityButton isCollapsed={isCollapsed} />}
          </div>

          <Separator orientation="horizontal" />
          <CollapsedNavigation />
        </div>
        <div
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg bg-transparent p-2 duration-300'
          )}
        >
          <GeneralSetting>
            <Button
              variant="outline"
              size="icon"
              className="!rounded-lg border-none shadow-none dark:text-brand-dark-text-gray hover:dark:text-white"
            >
              <SettingIcon />
            </Button>
          </GeneralSetting>

          {isAuth && (
            <Button
              variant="outline"
              size="icon"
              className="!rounded-lg border-none text-destructive shadow-none hover:bg-red-200 hover:text-destructive/80"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
            </Button>
          )}
          <ThemeToggle isCollapsed={isCollapsed} />
          {!isAuth && (
            <Button className="flex items-center space-x-2 bg-[#6E4AFF33] border-none hover:bg-[#A78BF633] text-sm font-semibold text-brand-component-text-secondary p-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Question className="cursor-pointer" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-96 border-none">
                    <p>{t('viewing_dummy')}</p>
                    <TooltipArrow className="z-10 fill-popover text-popover" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const Navigations = () => {
  const isAuth = useAuthenticated()
  const t = useTranslations('common')
  return (
    <div
      className={cn(
        'mt-2 flex flex-1 flex-col gap-1 py-2 transition-all duration-200'
      )}
    >
      {(isAuth
        ? NavigationData(t)
        : NavigationData(t).filter((n) => n.key !== 'workspace_settings')
      ).map((navigation) => {
        return <Navigation navigation={navigation} key={navigation.href} />
      })}
    </div>
  )
}

const Navigation = ({ navigation }: { navigation: TNavigation }) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )

  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  const isDisplayed = dynamicLayouts.includes(navigation.href)

  const handleCheckedChange = () => {
    const newLayout = getNewLayouts(dynamicLayouts, navigation.href)

    setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)

    toggleDynamicLayout(navigation.href)

    setCookieDirty(true)
  }

  return (
    <div
      className={cn('flex w-full items-center justify-between py-[2px]')}
      // onClick={onSelect}
    >
      <label
        className={cn(
          'flex flex-1 cursor-pointer items-center gap-2 overflow-hidden duration-300',
          isDisplayed
            ? 'text-brand-component-text-dark dark:text-white'
            : 'text-brand-text-gray dark:text-brand-dark-text-gray'
        )}
        htmlFor={navigation.href}
        onClick={navigation?.onClick}
      >
        <div className={cn('duration-200')}>{navigation.icon}</div>
        <div className="max-w-[90%] flex-1 truncate p-1">
          {uppercaseFirstLetter(navigation.title)}
        </div>
      </label>

      {navigation.isDynamic && !isCollapsed && (
        <Checkbox
          key={String(isDisplayed)}
          id={navigation.href}
          defaultChecked={isDisplayed}
          checked={navigation.isAlwayEnabled}
          onCheckedChange={() => {
            if (!navigation.isAlwayEnabled) {
              if (navigation.href === 'devices') {
                window.dispatchEvent(
                  new CustomEvent('deviceLayoutUpdated', {
                    detail: {
                      checked: !dynamicLayouts.includes('devices'),
                    },
                  })
                )
              }

              handleCheckedChange()
            }
          }}
        />
      )}
    </div>
  )
}

const CollapsedNavigation = () => {
  const t = useTranslations('common')

  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  const isAuth = useAuthenticated()

  return (
    <div className="my-4 flex w-full flex-col items-center justify-center gap-1">
      {(isAuth
        ? NavigationData(t)
        : NavigationData(t).filter((n) => n.key !== 'workspace_settings')
      ).map((navigation) => {
        const isDisplayed = dynamicLayouts.includes(navigation.href)

        const handleDynamicLayoutChange = () => {
          if (!navigation.isDynamic) return

          toggleDynamicLayout(navigation.href)
          const newLayout = getNewLayouts(dynamicLayouts, navigation.href)

          setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
          setCookieDirty(true)
        }

        return (
          <div
            onClick={handleDynamicLayoutChange}
            className={cn(
              'cursor-pointer rounded-lg p-2 duration-300',
              isDisplayed
                ? 'bg-brand-heading text-white dark:bg-brand-dark-fill-secondary'
                : 'bg-transparent hover:bg-slate-500/20 dark:text-brand-dark-text-gray hover:dark:bg-slate-500/40 hover:dark:!text-white'
            )}
            key={navigation.href}
          >
            {navigation.icon}
          </div>
        )
      })}
    </div>
  )
}

Sidebar.displayName = 'Sidebar'

export default Sidebar

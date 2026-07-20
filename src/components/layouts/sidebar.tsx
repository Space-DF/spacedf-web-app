'use client'

import {
  COOKIES,
  NavigationData,
  NavigationEnums,
  RESPONSIVE_BREAKPOINTS,
  Navigation as TNavigation,
} from '@/constants'
import { useKeyboardShortcut, useMounted } from '@/hooks'
import { useResponsiveLayout } from '@/hooks/use-responsive-layout'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { cn } from '@/lib/utils'
import {
  DynamicLayout,
  getNewLayouts,
  useLayout,
  useOrganizationValidationStore,
} from '@/stores'
import { getCookie, setCookie, uppercaseFirstLetter } from '@/utils'
import { Gem } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { ImperativePanelGroupHandle } from 'react-resizable-panels'
import { useShallow } from 'zustand/react/shallow'
import {
  Question,
  SettingIcon,
  SidebarCollapsedSimple,
  SidebarSimpleIcon,
} from '../icons'
import { Badge } from '../ui/badge'
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
import { useGeneralSetting } from './general-setting/store/useGeneralSetting'
import IdentityButton from './identity-button'
import ModalSearch from './modal-search'
import SwitchSpace from './switch-space'
import ThemeToggle from './theme-toggle'
import UserMenu from './user-menu'
import { useWindowSize } from '@/hooks/useWindowSize'
import { useDeviceStore } from '@/stores/device-store'

type SidebarChildProps = {
  onCollapseChanges?: () => void
  onChange3DBuildingFile?: () => void
  isPro?: boolean
}

const Sidebar = forwardRef<ImperativePanelGroupHandle | null>((props, ref) => {
  const [open, setOpen] = useState(false)
  const setDynamicLayouts = useLayout((state) => state.setDynamicLayouts)
  const setCollapsed = useLayout((state) => state.setCollapsed)
  const cookieDirty = useLayout((state) => state.cookieDirty)
  const isPro = useOrganizationValidationStore((state) => state.isPro)

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
    const maxLeftCollapsedSize = 50
    const percentMaxLeftCollapsedSize =
      (maxLeftCollapsedSize / window.innerWidth) * 100
    const finalLeftSize = Math.min(percentMaxLeftCollapsedSize, 4)
    if (isCollapsed)
      return ref?.current?.setLayout([finalLeftSize, 100 - finalLeftSize])
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
          `flex h-dvh border-r border-brand-stroke-dark-soft py-4 text-sm text-brand-component-text-dark shadow-md transition-all duration-300 dark:border-brand-stroke-outermost bg-background`
        )}
        id="sidebar-id"
      >
        <ExpandedSidebar
          onCollapseChanges={() => handleCollapseChanges(true)}
          isPro={isPro}
        />
        <CollapsedSidebar
          onCollapseChanges={() => handleCollapseChanges(false)}
          isPro={isPro}
        />
      </div>
      <ModalSearch open={open} setOpen={setOpen} />
      <GeneralSetting />
    </>
  )
})

const ExpandedSidebar = ({ onCollapseChanges, isPro }: SidebarChildProps) => {
  const isCollapsed = useLayout((state) => state.isCollapsed)
  const setCollapsed = useLayout((state) => state.setCollapsed)
  const t = useTranslations('common')
  const { mounted } = useMounted()

  const isAuth = useAuthenticated()
  const openGeneralSetting = useGeneralSetting((state) => state.openDialog)

  const containerRef = useRef<HTMLDivElement>(null)

  const handleCollapsedChange = () => {
    setCollapsed(true)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
    onCollapseChanges?.()
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex grow flex-col transition-all duration-300 px-2',
        isCollapsed
          ? '-translate-x- !h-0 !w-0 !px-0 animate-opacity-hide-effect overflow-hidden opacity-0'
          : 'w-full translate-x-0 animate-opacity-display-effect opacity-100'
      )}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-14 flex-1">
            {/* <IdentityButton isCollapsed={isCollapsed} /> */}
            {isAuth && mounted && <SwitchSpace isCollapsed={isCollapsed} />}
            {!isAuth && mounted && <IdentityButton isCollapsed={isCollapsed} />}
          </div>
          <SidebarSimpleIcon
            className="cursor-pointer justify-self-end text-muted-foreground"
            onClick={handleCollapsedChange}
          />
        </div>

        <Separator orientation="horizontal" className="mt-3" />
        <Navigations />
      </div>

      <div className="flex flex-col gap-1">
        {isAuth && mounted ? (
          <UserMenu isCollapsed={isCollapsed} />
        ) : (
          <Button
            variant="ghost"
            className="h-8 justify-start gap-2 p-0 text-accent-foreground duration-300 hover:bg-transparent "
            onClick={openGeneralSetting}
          >
            <SettingIcon />
            <p className="text-sm">{t('general_settings')}</p>
          </Button>
        )}

        <ThemeToggle isCollapsed={isCollapsed} />
        {isAuth && (
          <div
            className={cn(
              'bg-accent mt-2 text-primary rounded-button p-2 flex items-center justify-between w-full',
              isPro && 'border border-primary'
            )}
          >
            <div className="flex space-x-2 font-medium">
              <Gem size={16} />
              <span>{t('organization_plan')}</span>
            </div>
            <span className="font-bold">{isPro ? 'PRO' : 'FREE'}</span>
          </div>
        )}
        {!isAuth && (
          <Button className="flex items-center space-x-2 border-none text-sm font-semibold py-0 bg-accent text-primary hover:bg-accent/90">
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

const CollapsedSidebar = ({ onCollapseChanges, isPro }: SidebarChildProps) => {
  const isCollapsed = useLayout((state) => state.isCollapsed)
  const setCollapsed = useLayout((state) => state.setCollapsed)

  const { width } = useWindowSize()

  const { mounted } = useMounted()
  const t = useTranslations('common')

  const isAuth = useAuthenticated()
  const openGeneralSetting = useGeneralSetting((state) => state.openDialog)

  const handleCollapsedChange = () => {
    setCollapsed(false)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
    onCollapseChanges?.()
  }

  const isTablet = mounted && width > RESPONSIVE_BREAKPOINTS.TABLET

  return (
    <>
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
              {isTablet && (
                <div className="flex items-center justify-center">
                  <SidebarCollapsedSimple
                    className="col-span-1 cursor-pointer justify-self-end text-muted-foreground"
                    onClick={handleCollapsedChange}
                  />
                </div>
              )}
              {isAuth && mounted && <SwitchSpace isCollapsed={isCollapsed} />}
              {!isAuth && mounted && (
                <IdentityButton isCollapsed={isCollapsed} />
              )}
            </div>

            <Separator orientation="horizontal" />
            <CollapsedNavigation />
          </div>
          <div
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg bg-transparent p-2 duration-300'
            )}
          >
            {isAuth && mounted ? (
              <UserMenu isCollapsed={isCollapsed} />
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="border-none text-accent-foreground shadow-none hover:bg-transparent"
                onClick={openGeneralSetting}
              >
                <SettingIcon />
              </Button>
            )}

            <ThemeToggle isCollapsed={isCollapsed} />
            {isAuth && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'bg-accent mt-2 text-primary rounded-button flex justify-center size-9 items-center',
                      isPro && 'border border-primary'
                    )}
                  >
                    <Gem size={16} className="font-medium" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p>{`${t('organization_plan')}: ${isPro ? 'PRO' : 'FREE'}`}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {!isAuth && (
              <Button className="flex items-center space-x-2 bg-accent text-primary hover:bg-accent/90 border-none text-sm font-semibold p-2">
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
    </>
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
  const isCollapsed = useLayout((state) => state.isCollapsed)
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const toggleDynamicLayout = useLayout((state) => state.toggleDynamicLayout)
  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)
  const setCookieDirty = useLayout((state) => state.setCookieDirty)
  const isPro = useOrganizationValidationStore((state) => state.isPro)

  const isDisplayed = dynamicLayouts.includes(navigation.href)

  const handleCheckedChange = () => {
    const newLayout = getNewLayouts(dynamicLayouts, navigation.href)
    setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
    if (!newLayout.includes(NavigationEnums.DEVICES)) {
      setDeviceSelected('')
    }
    toggleDynamicLayout(navigation.href)

    setCookieDirty(true)
  }

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between py-[2px] px-2 rounded-input',
        isDisplayed || navigation.isAlwayEnabled ? 'bg-accent ' : ''
      )}
    >
      <label
        className="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden duration-300 text-accent-foreground font-medium"
        htmlFor={navigation.href}
        onClick={navigation?.onClick}
      >
        <div className="duration-200 font-bold">{navigation.icon}</div>
        <div className="max-w-[90%] flex-1 truncate p-1">
          {uppercaseFirstLetter(navigation.title)}
        </div>
      </label>

      {navigation.isPro && !isPro && !isCollapsed && (
        <Badge
          variant="secondary"
          className="shrink-0 px-2 py-0 text-[10px] bg-accent border border-border !rounded-md font-semibold tracking-wide"
        >
          PRO
        </Badge>
      )}

      {navigation.isDynamic && !isCollapsed && (
        <Checkbox
          key={String(isDisplayed)}
          id={navigation.href}
          defaultChecked={isDisplayed}
          aria-label={navigation.title}
          aria-labelledby={`${navigation.href}-label`}
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

  const dynamicLayouts = useLayout((state) => state.dynamicLayouts)
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const setCookieDirty = useLayout((state) => state.setCookieDirty)
  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)

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

          const newLayout = getNewLayouts(dynamicLayouts, navigation.href)

          if (!newLayout.includes(NavigationEnums.DEVICES)) {
            setDeviceSelected('')
          }

          toggleDynamicLayout(navigation.href)

          setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
          setCookieDirty(true)
        }

        return (
          <Tooltip key={navigation.href}>
            <TooltipTrigger>
              <div
                onClick={handleDynamicLayoutChange}
                className={cn(
                  'cursor-pointer rounded-lg p-2 duration-300 text-accent-foreground',
                  isDisplayed ? 'bg-accent' : 'bg-transparent hover:bg-accent'
                )}
              >
                {navigation.icon}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p>{uppercaseFirstLetter(navigation.title)}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

Sidebar.displayName = 'Sidebar'

export default Sidebar

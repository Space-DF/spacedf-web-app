/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { forwardRef, useEffect, useState } from 'react'
import { ImperativePanelGroupHandle } from 'react-resizable-panels'
import { useShallow } from 'zustand/react/shallow'
import { COOKIES, Navigation as TNavigation, navigations } from '@/constants'
import { useKeyboardShortcut, useMounted } from '@/hooks'
import { cn } from '@/lib/utils'
import { DynamicLayout, getNewLayouts, useLayout } from '@/stores'
import { CommonModalProps } from '@/types/common'
import { getCookie, setCookie, uppercaseFirstLetter } from '@/utils'
import {
  SettingIcon,
  SidebarCollapsedSimple,
  SidebarSimpleIcon,
} from '../icons'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'
import GeneralSetting from './general-setting'
import IdentityButton from './identity-button'
import ModalSearch from './modal-search'
import SwitchSpace from './switch-space'
import ThemeToggle from './theme-toggle'

type SidebarChildProps = {
  setOpen: CommonModalProps['setOpen']
  onCollapseChanges?: () => void
}

const Sidebar = forwardRef<ImperativePanelGroupHandle | null>((props, ref) => {
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const cookieDirty = useLayout(useShallow((state) => state.cookieDirty))
  const [open, setOpen] = useState(false)

  const setDynamicLayouts = useLayout(
    useShallow((state) => state.setDynamicLayouts),
  )

  const defaultCollapsed = getCookie<boolean>(COOKIES.SIDEBAR_COLLAPSED, false)
  const defaultDynamicLayouts = getCookie(
    COOKIES.DYNAMIC_LAYOUTS,
    [] as DynamicLayout[],
  )

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
    ref?.current?.setLayout([25, 75])
  }

  useKeyboardShortcut({
    keys: ['k'],
    onPress: handleCommandSearch,
  })

  return (
    <>
      <div
        className={cn(
          `flex min-h-screen border-r border-brand-stroke-dark-soft p-4 text-sm text-brand-text-dark shadow-md transition-all duration-300 dark:border-brand-stroke-outermost dark:bg-brand-fill-outermost`,
        )}
        id="sidebar-id"
      >
        <ExpandedSidebar
          setOpen={setOpen}
          onCollapseChanges={() => handleCollapseChanges(true)}
        />
        <CollapsedSidebar
          setOpen={setOpen}
          onCollapseChanges={() => handleCollapseChanges(false)}
        />
      </div>
      <ModalSearch open={open} setOpen={setOpen} />
    </>
  )
})

const ExpandedSidebar = ({ setOpen, onCollapseChanges }: SidebarChildProps) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const t = useTranslations('common')
  const { mounted } = useMounted()

  const { status } = useSession()

  const isAuth = status === 'authenticated'

  const handleCollapsedChange = () => {
    setCollapsed(true)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
    onCollapseChanges?.()
  }

  return (
    <div
      className={cn(
        'flex grow flex-col transition-all duration-300',
        isCollapsed
          ? '-translate-x- !h-0 !w-0 animate-opacity-hide-effect overflow-hidden opacity-0'
          : 'w-full translate-x-0 animate-opacity-display-effect opacity-100',
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
        <Button
          onClick={() => setOpen?.(true)}
          className={cn(
            'my-3 h-10 w-full justify-between rounded-lg bg-brand-fill-dark-soft duration-200 dark:bg-brand-heading',
          )}
          variant="ghost"
        >
          <div className="flex items-center gap-2 text-brand-text-gray">
            <MagnifyingGlassIcon className="size-5" />
            {t('search')}
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center bg-transparent text-sm font-medium text-muted-foreground opacity-100">
            <span className="text-lg">⌘</span>K
          </kbd>
        </Button>

        <Separator orientation="horizontal" />
        <Navigations />
      </div>

      <div className="flex flex-col gap-2">
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
            onClick={() => signOut()}
          >
            <LogOut size={16} />
            <p className="text-sm">{t('sign_out')}</p>
          </Button>
        )}

        <ThemeToggle isCollapsed={isCollapsed} />
      </div>
    </div>
  )
}

const CollapsedSidebar = ({
  setOpen,
  onCollapseChanges,
}: SidebarChildProps) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const { status } = useSession()
  const { mounted } = useMounted()

  const isAuth = status === 'authenticated'

  const handleCollapsedChange = () => {
    setCollapsed(false)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
    onCollapseChanges?.()
  }

  return (
    <div
      className={cn(
        'flex flex-col py-2 transition-all duration-200',
        isCollapsed
          ? 'w-full translate-x-0 animate-opacity-display-effect opacity-100'
          : '!h-0 !w-0 -translate-x-full animate-opacity-hide-effect overflow-hidden opacity-0',
      )}
    >
      <div
        className={cn(
          'flex grow flex-col items-center justify-center duration-200',
        )}
      >
        <div className="flex flex-1 flex-col items-center gap-3">
          <div className="my-2 flex items-center justify-center">
            <SidebarCollapsedSimple
              className="col-span-1 cursor-pointer justify-self-end text-brand-text-gray"
              onClick={handleCollapsedChange}
            />
          </div>

          {isAuth && mounted && <SwitchSpace isCollapsed={isCollapsed} />}

          {!isAuth && mounted && <IdentityButton isCollapsed={isCollapsed} />}

          <Button
            variant="ghost"
            size="icon"
            className="my-2 !rounded-lg text-brand-text-gray"
            onClick={() => setOpen?.(true)}
          >
            <MagnifyingGlassIcon className="size-5" />
          </Button>
          <Separator orientation="horizontal" />
          <CollapsedNavigation />
        </div>
        <div
          className={cn(
            'cursor-pointer, flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg bg-transparent p-2 duration-300',
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
              onClick={() => signOut()}
            >
              <LogOut size={16} />
            </Button>
          )}
          <ThemeToggle isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  )
}

const Navigations = () => {
  const t = useTranslations('common')
  return (
    <div
      className={cn(
        'mt-3 flex flex-1 flex-col gap-1 py-2 transition-all duration-200',
      )}
    >
      {navigations(t).map((navigation) => {
        return <Navigation navigation={navigation} key={navigation.href} />
      })}
    </div>
  )
}

const Navigation = ({ navigation }: { navigation: TNavigation }) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout),
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  const isDisplayed = dynamicLayouts.includes(navigation.href)

  const handleCheckedChange = () => {
    // window.mapInstance.resize()

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
            ? 'text-brand-text-dark dark:text-white'
            : 'text-brand-text-gray dark:text-brand-dark-text-gray',
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
    useShallow((state) => state.toggleDynamicLayout),
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  return (
    <div className="my-4 flex w-full flex-col items-center justify-center gap-2">
      {navigations(t).map((navigation) => {
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
                : 'bg-transparent hover:bg-slate-500/20 dark:text-brand-dark-text-gray hover:dark:bg-slate-500/40 hover:dark:!text-white',
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

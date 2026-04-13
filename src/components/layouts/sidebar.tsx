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
import { useIsDemo } from '@/hooks/useIsDemo'
import { cn } from '@/lib/utils'
import {
  DynamicLayout,
  getNewLayouts,
  useLayout,
  useOrganizationValidationStore,
} from '@/stores'
import { getCookie, setCookie, uppercaseFirstLetter } from '@/utils'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
} from 'react'
import { ImperativePanelGroupHandle } from 'react-resizable-panels'
import { useShallow } from 'zustand/react/shallow'
import {
  FileArrowUp,
  Question,
  SettingIcon,
  SidebarCollapsedSimple,
  SidebarSimpleIcon,
  Swap,
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
import { useCache } from '@/hooks/useCache'
import { useWindowSize } from '@/hooks/useWindowSize'
import { useDeviceStore } from '@/stores/device-store'
import { useModelGLB } from '@/stores/template/model-glb'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { toast } from 'sonner'

type SidebarChildProps = {
  onCollapseChanges?: () => void
  onChange3DBuildingFile?: () => void
}

const Sidebar = forwardRef<ImperativePanelGroupHandle | null>((props, ref) => {
  const [open, setOpen] = useState(false)
  const [isOpenDialogChangeGlbFile, setIsOpenDialogChangeGlbFile] =
    useState(false)
  const setDynamicLayouts = useLayout((state) => state.setDynamicLayouts)
  const setCollapsed = useLayout((state) => state.setCollapsed)
  const cookieDirty = useLayout((state) => state.cookieDirty)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastObjectUrlRef = useRef<string | null>(null)
  const tSmartBuilding = useTranslations('smartBuilding')
  const {
    modelGLB,
    modelGLBUrl,
    setModelGLB,
    setModelGLBUrl,
    openUploadPicker,
  } = useModelGLB(
    useShallow((state) => ({
      modelGLB: state.modelGLB,
      setModelGLB: state.setModelGLB,
      setModelGLBUrl: state.setModelGLBUrl,
      openUploadPicker: state.openUploadPicker,
      modelGLBUrl: state.modelGLBUrl,
    }))
  )
  const maxBytes = useMemo(() => 100 * 1024 * 1024, [])

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

  const handleSelectedGlbFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const isGlb =
      file.name.toLowerCase().endsWith('.glb') ||
      file.name.toLowerCase().endsWith('.usdz') ||
      file.type === 'model/gltf-binary' ||
      file.type === 'application/octet-stream'

    if (!isGlb) {
      toast.error(tSmartBuilding('invalid_three_model'))
      return
    }

    if (file.size > maxBytes) {
      toast.error(tSmartBuilding('three_model_too_large'))
      return
    }

    const url = URL.createObjectURL(file)
    if (lastObjectUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(lastObjectUrlRef.current)
    }
    lastObjectUrlRef.current = url

    setModelGLB(file.name)
    setModelGLBUrl(url)
  }

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(lastObjectUrlRef.current)
      }
    }
  }, [])

  const handleRequestChange3DBuildingFile = () => {
    if (modelGLB || modelGLBUrl) {
      setIsOpenDialogChangeGlbFile(true)
      return
    }
    openUploadPicker()
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".glb,model/gltf-binary,application/octet-stream,.usdz"
        onChange={handleSelectedGlbFile}
      />
      <ConfirmDialog
        open={isOpenDialogChangeGlbFile}
        title={tSmartBuilding('change_glb_title')}
        description={tSmartBuilding('change_glb_description')}
        cancelLabel={tSmartBuilding('cancel')}
        confirmLabel={tSmartBuilding('confirm')}
        onCancel={() => setIsOpenDialogChangeGlbFile(false)}
        onConfirm={() => {
          setIsOpenDialogChangeGlbFile(false)
          requestAnimationFrame(openUploadPicker)
        }}
      />
      <div
        className={cn(
          `flex h-dvh border-r border-brand-stroke-dark-soft p-4 text-sm text-brand-component-text-dark shadow-md transition-all duration-300 dark:border-brand-stroke-outermost dark:bg-brand-fill-outermost`
        )}
        id="sidebar-id"
      >
        <ExpandedSidebar
          onCollapseChanges={() => handleCollapseChanges(true)}
          onChange3DBuildingFile={handleRequestChange3DBuildingFile}
        />
        <CollapsedSidebar
          onCollapseChanges={() => handleCollapseChanges(false)}
          onChange3DBuildingFile={handleRequestChange3DBuildingFile}
        />
      </div>
      <ModalSearch open={open} setOpen={setOpen} />
    </>
  )
})

const SIDEBAR_ICON_HIDE_THRESHOLD = 200

const ExpandedSidebar = ({
  onCollapseChanges,
  onChange3DBuildingFile,
}: SidebarChildProps) => {
  const isCollapsed = useLayout((state) => state.isCollapsed)
  const setCollapsed = useLayout((state) => state.setCollapsed)
  const { modelGLB, modelGLBUrl } = useModelGLB(
    useShallow((state) => ({
      modelGLB: state.modelGLB,
      modelGLBUrl: state.modelGLBUrl,
    }))
  )
  const router = useRouter()
  const t = useTranslations('common')
  const { mounted } = useMounted()

  const isAuth = useAuthenticated()
  const isDemo = useIsDemo()

  const { clearAllCache } = useCache()

  const template = useOrganizationValidationStore((state) => state.template)

  const isSmartBuilding = template === 'smart_building'

  const containerRef = useRef<HTMLDivElement>(null)
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setIsNarrow(entry.contentRect.width < SIDEBAR_ICON_HIDE_THRESHOLD)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleCollapsedChange = () => {
    setCollapsed(true)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
    onCollapseChanges?.()
  }

  const handleSignOut = async () => {
    if (isDemo) return
    await signOut({ redirect: false })
    window.history.replaceState({}, '', window.location.pathname)
    router.push('/', { scroll: false })
    clearAllCache()
  }

  return (
    <div
      ref={containerRef}
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
        {isSmartBuilding ? (
          <>
            <Separator orientation="horizontal" className="my-3" />
            <div className="bg-brand-component-fill-dark-soft rounded-lg p-2 space-y-2">
              {modelGLB ? (
                <div className="flex space-x-1 text-brand-component-text-gray justify-center">
                  {!isNarrow && <FileArrowUp />}
                  <span className="md:max-w-96 sm:max-w-48 line-clamp-1 truncate">
                    {modelGLB}
                  </span>
                </div>
              ) : (
                <></>
              )}

              <Button
                className="flex items-center gap-x-2 py-1 w-full"
                onClick={onChange3DBuildingFile}
              >
                <span className="md:max-w-96 sm:max-w-48 line-clamp-1 truncate">
                  {modelGLB || modelGLBUrl ? 'Change' : 'Upload'} 3D Building
                  File
                </span>
                {!isNarrow && <Swap />}
              </Button>
            </div>
          </>
        ) : (
          <></>
        )}
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

const CollapsedSidebar = ({
  onCollapseChanges,
  onChange3DBuildingFile,
}: SidebarChildProps) => {
  const isCollapsed = useLayout((state) => state.isCollapsed)
  const setCollapsed = useLayout((state) => state.setCollapsed)
  const { clearAllCache } = useCache()
  const router = useRouter()

  const template = useOrganizationValidationStore((state) => state.template)

  const isSmartBuilding = template === 'smart_building'

  const { width } = useWindowSize()

  const { mounted } = useMounted()
  const t = useTranslations('common')

  const isAuth = useAuthenticated()

  const handleCollapsedChange = () => {
    setCollapsed(false)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
    onCollapseChanges?.()
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.history.replaceState({}, '', window.location.pathname)
    clearAllCache()
    router.push('/')
  }

  const isTablet = width > RESPONSIVE_BREAKPOINTS.TABLET

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
                    className="col-span-1 cursor-pointer justify-self-end text-brand-text-gray"
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
            {isSmartBuilding ? (
              <>
                <Separator orientation="horizontal" className="my-3" />
                <div className="bg-brand-component-fill-dark-soft rounded-lg p-2 space-y-2">
                  <Button size="icon" onClick={onChange3DBuildingFile}>
                    <Swap />
                  </Button>
                </div>
              </>
            ) : (
              <></>
            )}
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

  const dynamicLayouts = useLayout((state) => state.dynamicLayouts)
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const setCookieDirty = useLayout((state) => state.setCookieDirty)

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
          <Tooltip key={navigation.href}>
            <TooltipTrigger>
              <div
                onClick={handleDynamicLayoutChange}
                className={cn(
                  'cursor-pointer rounded-lg p-2 duration-300',
                  isDisplayed
                    ? 'bg-brand-heading text-white dark:bg-brand-dark-fill-secondary'
                    : 'bg-transparent hover:bg-slate-500/20 dark:text-brand-dark-text-gray hover:dark:bg-slate-500/40 hover:dark:!text-white'
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

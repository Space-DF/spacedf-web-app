/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { COOKIES, Navigation as TNavigation, navigations } from "@/constants"
import { useCommand } from "@/hooks"
import { cn } from "@/lib/utils"
import { DynamicLayout, getNewLayouts, useLayout } from "@/stores"
import { CommonModalProps } from "@/types/common"
import { getCookie, setCookie, uppercaseFirstLetter } from "@/utils"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useTranslations } from "next-intl"
import { forwardRef, useEffect, useState } from "react"
import { ImperativePanelGroupHandle } from "react-resizable-panels"
import { useShallow } from "zustand/react/shallow"
import {
  SettingIcon,
  SidebarCollapsedSimple,
  SidebarSimpleIcon,
} from "../icons"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import SelectSpace from "../ui/select-space"
import { Separator } from "../ui/separator"
import ModalSearch from "./modal-search"
import { useTheme } from "next-themes"
import ThemeToggle from "./theme-toggle"
import GeneralSetting from "./general-setting"

type SidebarChildProps = {
  setOpen: CommonModalProps["setOpen"]
  onCollapseChanges?: () => void
}

const Sidebar = forwardRef<ImperativePanelGroupHandle | null>((props, ref) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const cookieDirty = useLayout(useShallow((state) => state.cookieDirty))
  const [open, setOpen] = useState(false)

  const setDynamicLayouts = useLayout(
    useShallow((state) => state.setDynamicLayouts)
  )

  const defaultCollapsed = getCookie(COOKIES.SIDEBAR_COLLAPSED, false)
  const defaultDynamicLayouts = getCookie(
    COOKIES.DYNAMIC_LAYOUTS,
    [] as DynamicLayout[]
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
    if (!ref || !("current" in ref)) return

    if (isCollapsed) return ref?.current?.setLayout([4, 96])
    ref?.current?.setLayout([25, 75])
  }

  useCommand("k", handleCommandSearch)

  return (
    <>
      <div
        className={cn(
          `min-h-screen border-r border-brand-stroke-dark-soft shadow-md p-4 duration-300 transition-all text-brand-text-dark flex`
          // isCollapsed ? "w-14" : "w-[25%] max-w-96"
        )}
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

  const t = useTranslations("common")

  const handleCollapsedChange = () => {
    setCollapsed(true)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
    onCollapseChanges?.()
  }

  return (
    <div
      className={cn(
        "duration-300 transition-all grow flex flex-col",
        isCollapsed
          ? "!w-0 !h-0 opacity-0 -translate-x- overflow-hidden animate-opacity-hide-effect"
          : "w-full opacity-100 translate-x-0 animate-opacity-display-effect"
      )}
    >
      <div className="flex-1">
        <div className={cn("flex gap-3 items-center justify-between")}>
          <div className="flex-1 min-w-14">
            <SelectSpace defaultValue="1" />
          </div>
          <SidebarSimpleIcon
            className="text-brand-text-gray cursor-pointer justify-self-end"
            onClick={handleCollapsedChange}
          />
        </div>
        <Button
          onClick={() => setOpen?.(true)}
          className={cn(
            "rounded-lg justify-between bg-brand-fill-dark-soft duration-200 h-10 w-full my-3"
          )}
          variant="ghost"
        >
          <div className="flex items-center gap-2 text-brand-text-gray">
            <MagnifyingGlassIcon className="w-5 h-5" />
            {t("search")}
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center font-medium text-muted-foreground opacity-100 bg-transparent text-sm">
            <span className="text-lg">⌘</span>K
          </kbd>
        </Button>

        <Separator orientation="horizontal" />
        <Navigations />
      </div>

      <div className="flex flex-col">
        <GeneralSetting>
          <Button
            variant="ghost"
            className="my-1 justify-start p-0 hover:bg-transparent gap-3"
          >
            {/* <Navigation
              navigation={{
                href: "" as any,
                title: "General Setting",
                icon: <SettingIcon />,
              }}
            /> */}
            <SettingIcon />
            General Setting
          </Button>
        </GeneralSetting>

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

  const handleCollapsedChange = () => {
    setCollapsed(false)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
    onCollapseChanges?.()
  }

  return (
    <div
      className={cn(
        "py-2 duration-200 transition-all flex flex-col",
        isCollapsed
          ? "w-full opacity-100 translate-x-0 animate-opacity-display-effect"
          : "!w-0 !h-0 opacity-0 -translate-x-full overflow-hidden animate-opacity-hide-effect"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center flex-col duration-200 grow"
        )}
      >
        <div className="flex-1">
          <div className="flex items-center justify-center">
            <SidebarCollapsedSimple
              className="text-brand-text-gray cursor-pointer col-span-1 justify-self-end"
              onClick={handleCollapsedChange}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="my-5 text-brand-text-gray"
            onClick={() => setOpen?.(true)}
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </Button>
          <Separator orientation="horizontal" />
          <CollapsedNavigation />
        </div>
        <div
          className={cn(
            "p-2 rounded-lg duration-300 cursor-pointer, bg-transparent cursor-pointer flex items-center justify-center flex-col gap-3"
          )}
        >
          <GeneralSetting>
            <Button
              variant="outline"
              size="icon"
              className="border-none shadow-none "
            >
              <SettingIcon />
            </Button>
          </GeneralSetting>
          <ThemeToggle isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  )
}

const Navigations = () => {
  const t = useTranslations("common")
  return (
    <div
      className={cn(
        "py-2 duration-200 transition-all flex flex-col gap-1 mt-4 flex-1"
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
      className={cn("flex items-center justify-between w-full")}
      // onClick={onSelect}
    >
      <label
        className={cn(
          "flex items-center gap-2 cursor-pointer flex-1 overflow-hidden"
          // isCollapsed ? "w-0 h-0 pointer-events-none" : "flex-1"
        )}
        htmlFor={navigation.href}
      >
        <div className={cn("duration-200")}>{navigation.icon}</div>
        <div className="p-1 flex-1 max-w-[90%] truncate ">
          {uppercaseFirstLetter(navigation.title)}
        </div>
      </label>

      {navigation.isDynamic && !isCollapsed && (
        <Checkbox
          key={String(isDisplayed)}
          id={navigation.href}
          defaultChecked={isDisplayed}
          onCheckedChange={handleCheckedChange}
        />
      )}
    </div>
  )
}

const CollapsedNavigation = () => {
  const t = useTranslations("common")

  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  return (
    <div className="flex items-center justify-center flex-col w-full gap-2 my-4">
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
              "p-2 rounded-lg duration-300 cursor-pointer",
              isDisplayed ? "bg-brand-heading text-white" : "bg-transparent"
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

Sidebar.displayName = "Sidebar"

export default Sidebar

/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { COOKIES, Navigation as TNavigation, navigations } from "@/constants"
import { useCommand } from "@/hooks"
import { cn } from "@/lib/utils"
import { DynamicLayout, getNewLayouts, useLayout } from "@/stores"
import { CommonModalProps } from "@/types/common"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { SidebarCollapsedSimple, SidebarSimpleIcon } from "../icons"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import SelectSpace from "../ui/select-space"
import { Separator } from "../ui/separator"
import ModalSearch from "./modal-search"
import { checkDisplayedDynamicLayout, getCookie, setCookie } from "@/utils"

const Sidebar = () => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
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
    setDynamicLayouts(defaultDynamicLayouts)
  }, [defaultDynamicLayouts])

  const [open, setOpen] = useState(false)

  const handleCommandSearch = () => {
    setOpen((open) => !open)
  }

  useCommand("k", handleCommandSearch)

  return (
    <div
      className={cn(
        `min-h-screen border-r border-brand-strock-dark-soft shadow-md p-4 duration-300 transition-all text-brand-text-dark`,
        isCollapsed ? "w-14" : "w-[25%] max-w-96"
      )}
    >
      <ExpandedSidebar setOpen={setOpen} />
      <CollapsedSidebar setOpen={setOpen} />
      <ModalSearch open={open} setOpen={setOpen} />
    </div>
  )
}

const ExpandedSidebar = ({ setOpen }: Pick<CommonModalProps, "setOpen">) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const handleCollapsedChange = () => {
    setCollapsed(true)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
  }

  return (
    <div
      className={cn(
        "duration-100 transition-opacity",
        isCollapsed ? "!w-0 !h-0 opacity-0" : "w-full opacity-100"
      )}
    >
      <div className={cn("grid grid-cols-12 gap-3 items-center")}>
        <div className="col-span-11">
          <SelectSpace
            defaultValue="1"
            triggerClass={cn(
              isCollapsed ? "!w-0 !h-0 pointer-events-none" : "w-full"
            )}
          />
        </div>
        <SidebarSimpleIcon
          className="text-brand-text-gray cursor-pointer col-span-1 justify-self-end"
          onClick={handleCollapsedChange}
        />
      </div>
      <Button
        onClick={() => setOpen?.(true)}
        className={cn(
          "rounded-lg justify-between bg-brand-fill-dark-soft duration-200",
          isCollapsed ? "pointer-events-none w-0 h-0" : "h-10 w-full my-3"
        )}
        variant="ghost"
      >
        <div className="flex items-center gap-2 text-brand-text-gray">
          <MagnifyingGlassIcon className="w-5 h-5" />
          Search
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-muted-foreground opacity-100">
          <span>⌘</span>K
        </kbd>
      </Button>

      <Separator orientation="horizontal" />
      <Navigations />
    </div>
  )
}

const CollapsedSidebar = ({ setOpen }: Pick<CommonModalProps, "setOpen">) => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const handleCollapsedChange = () => {
    setCollapsed(false)
    setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
  }

  return (
    <div
      className={cn(
        "py-2 duration-100 transition-opacity",
        isCollapsed ? "w-full opacity-100" : "!w-0 !h-0 opacity-0"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center flex-col duration-200",
          isCollapsed ? "w-full h-full opacity-100" : "w-0 h-0 opacity-0"
        )}
      >
        <SidebarCollapsedSimple
          className="text-brand-text-gray cursor-pointer col-span-1 justify-self-end"
          onClick={handleCollapsedChange}
        />
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
    </div>
  )
}

const Navigations = () => {
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))

  return (
    <div
      className={cn(
        "py-2 duration-200 transition-all flex flex-col gap-1 mt-4",
        isCollapsed ? "w-0 h-0 opacity-0" : "!w-full !h-max opacity-100"
      )}
    >
      {navigations.map((navigation) => {
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
      className={cn(
        "flex items-center justify-between",
        isCollapsed ? "w-0 h-0 opacity-0" : "w-full opacity-100"
      )}
    >
      <label
        className={cn(
          "flex items-center gap-2 cursor-pointer",
          isCollapsed ? "w-0 h-0 pointer-events-none" : "flex-1"
        )}
        htmlFor={navigation.href}
      >
        <div
          className={cn(
            "duration-200",
            isCollapsed
              ? "opacity-0 -translate-x-10"
              : "!w-max !h-max opacity-100 translate-x-0"
          )}
        >
          {navigation.icon}
        </div>
        <div className="p-1 flex-1 truncate">{navigation.title}</div>
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
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  return (
    <div className="flex items-center justify-center flex-col w-full gap-2 my-4">
      {navigations.map((navigation) => {
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

export default Sidebar

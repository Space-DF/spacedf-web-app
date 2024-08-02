"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { spaceList } from "@/data/dummy-data"
import { useGlobalStore } from "@/stores"
import { TSpace } from "@/types/common"
import React, { useCallback } from "react"
import { useShallow } from "zustand/react/shallow"
import AddNewSpace from "./add-new-space"
import OrganizationManagement from "./organization-management"
import Space from "./space"
import SpaceMenuItem from "./space-menu-item"

type SwitchSpaceProps = {
  isCollapsed?: boolean
}

const SwitchSpace = ({ isCollapsed }: SwitchSpaceProps) => {
  const { currentSpace, setCurrentSpace } = useGlobalStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
      setCurrentSpace: state.setCurrentSpace,
    }))
  )

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const { code, metaKey, altKey } = event
      const numberFromCode = code[code.length - 1]

      const isDetectShortCut =
        Number(numberFromCode) < 10 &&
        Number(numberFromCode) <= spaceList.length

      if (!isDetectShortCut) return

      if (metaKey && altKey) {
        setCurrentSpace(spaceList[Number(numberFromCode) - 1].id)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const customMatchKeys = useCallback(
    (keys: string[], event: KeyboardEvent) => {
      const { code, metaKey, altKey } = event

      const numberFromCode = code[code.length - 1]

      const expectedKeys = keys.map((k) => k.toLowerCase())
      const currentKeys = [numberFromCode.toLowerCase()]

      if (metaKey) currentKeys.push("meta")
      if (altKey) currentKeys.push("alt")

      return expectedKeys.every((k) => currentKeys.includes(k))
    },
    []
  )

  const spaceSelected =
    spaceList.find((space) => space.id === currentSpace) || ({} as TSpace)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Space
            spaceData={spaceSelected}
            isSelected
            hiddenOption={isCollapsed}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="backdrop-blur-sm bg-brand-fill-outermost/70 w-80 text-white border-brand-stroke-dark-soft dark:border-brand-stroke-outermost"
        sideOffset={10}
        collisionPadding={10}
      >
        <DropdownMenuLabel>Switch Space</DropdownMenuLabel>

        <DropdownMenuGroup>
          {spaceList.map((space, index) => (
            <DropdownMenuItem
              key={space.id}
              onClick={() => setCurrentSpace(space.id)}
            >
              <SpaceMenuItem spaceData={space} position={index} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <Separator className="bg-zinc-500 dark:bg-brand-stroke-outermost my-3" />

        <DropdownMenuItem className="py-2">
          <AddNewSpace />
        </DropdownMenuItem>

        <DropdownMenuItem className="py-2 mb-2">
          <OrganizationManagement />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SwitchSpace

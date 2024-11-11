/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { spaceList } from '@/data/dummy-data'
import { useGlobalStore } from '@/stores'
import { TSpace } from '@/types/common'
import AddNewSpace from './add-new-space'
import Space from './space'
import SpaceMenuItem from './space-menu-item'

type SwitchSpaceProps = {
  isCollapsed?: boolean
}

const SwitchSpace = ({ isCollapsed }: SwitchSpaceProps) => {
  const t = useTranslations('space')
  const { currentSpace, setCurrentSpace } = useGlobalStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
      setCurrentSpace: state.setCurrentSpace,
    })),
  )

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const { code, metaKey, altKey } = event
      const numberFromCode = code?.[code?.length - 1]

      const isDetectShortCut =
        Number(numberFromCode) < 10 &&
        Number(numberFromCode) <= spaceList.length

      if (!isDetectShortCut) return

      if (metaKey && altKey) {
        setCurrentSpace(spaceList[Number(numberFromCode) - 1].id)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const customMatchKeys = useCallback(
    (keys: string[], event: KeyboardEvent) => {
      const { code, metaKey, altKey } = event

      const numberFromCode = code[code.length - 1]

      const expectedKeys = keys.map((k) => k.toLowerCase())
      const currentKeys = [numberFromCode.toLowerCase()]

      if (metaKey) currentKeys.push('meta')
      if (altKey) currentKeys.push('alt')

      return expectedKeys.every((k) => currentKeys.includes(k))
    },
    [],
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
        className="w-80 rounded-xl border-brand-stroke-outermost bg-brand-dark-bg-space p-3 text-white backdrop-blur-xl"
        sideOffset={10}
        collisionPadding={10}
      >
        <DropdownMenuLabel className="p-0 text-xs font-semibold leading-normal">
          {t('switch_space')}
        </DropdownMenuLabel>

        <DropdownMenuGroup className="mt-2 space-y-1">
          {spaceList.map((space, index) => (
            <DropdownMenuItem
              key={space.id}
              onClick={() => setCurrentSpace(space.id)}
              className="cursor-pointer rounded-xl p-1 focus:bg-brand-fill-outermost"
            >
              <SpaceMenuItem spaceData={space} position={index} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <Separator className="my-2 bg-zinc-500 dark:bg-brand-stroke-outermost" />

        <DropdownMenuItem className="p-0 focus:bg-transparent">
          <AddNewSpace />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SwitchSpace
